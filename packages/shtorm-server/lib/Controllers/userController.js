import DatabaseController from './databaseController'
import shortid from 'shortid'
import { hashSync, compareSync, genSaltSync } from 'bcryptjs'
import { Strategy } from 'passport-local'
import { check, body, validationResult } from 'express-validator/check'

const db = DatabaseController.getDatabase('users')

class Permission {
  _baseCheck = (callback) => body('permission').custom((val, { req }) => callback(req))
  _logInMessage = 'You need to log in first.'
  _notPermittedMessage = 'You are not permitted to do this.'

  check = (right) => {
    return this._baseCheck(req => {
      if (!req.user) throw new Error(this._logInMessage)
      if (typeof right === 'string' && req.user.rights[right] === false) throw new Error(this._notPermittedMessage)
      return true
    })
  }

  checkOneOf = (rights) => {
    return this._baseCheck(req => {
      let permittedRights = 0
      if (!req.user) throw new Error(this._logInMessage)
      if (Array.isArray(rights)) {
        rights.forEach((right) => {
          if (req.user.rights[right] === true) permittedRights++
        })
        if (permittedRights === 0) throw new Error(this._notPermittedMessage)
      }
      return true
    })
  }

  checkAllOf = (rights) => {
    return this.baseCheck(req => {
      let permittedRights = 0
      if (!req.user) throw new Error(this.logInMessage)
      if (Array.isArray(rights)) {
        rights.forEach((right) => {
          if (req.user.rights[right] === true) permittedRights++
        })
        if (permittedRights < rights.length) throw new Error(this.notPermittedMessage)
      }
      return true
    })
  }
}

export const permission = new Permission()
export const validateUser = (type) => {
  switch (type) {
    case 'admin':
      return [ permission.checkOneOf(['isAdmin', 'isOriginal']) ]
    case 'executePresets':
      return [ permission.checkOneOf(['executePresets', 'modifyPresets', 'createPresets', 'isAdmin', 'isOriginal']) ]
    case 'modifyPresets':
      return [ permission.checkOneOf(['modifyPresets', 'createPresets', 'isAdmin', 'isOriginal']) ]
    case 'createPresets':
      return [ permission.checkOneOf(['createPresets', 'isAdmin', 'isOriginal']) ]
    case 'viewConfigs':
      return [ permission.checkOneOf(['createConfigs', 'modifyPresets', 'createPresets', 'isAdmin', 'isOriginal']) ]
    case 'createConfigs':
      return [ permission.checkOneOf(['createConfigs', 'isAdmin', 'isOriginal']) ]
    case 'getUser':
      return [
        ...validateUser('admin'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true }).withMessage('Missing paramter "id".')
          .isString().withMessage('Parameter "id" needs to be of type string!')
      ]
    case 'saveUser':
      return [
        ...validateUser('admin'),
        check('username')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('Username is required!')
          .isString()
          .withMessage('Username must be a string!')
          .isLength({ min: 3 })
          .withMessage('Username needs to be at least 3 chars long!')
          .custom((username, { req }) => {
            // Custom check for the availability of the username
            const { id } = req.body
            const existingUsername = db.find({ username }).value()
            if (existingUsername && existingUsername.id !== id) return false
            return true
          })
          .withMessage((value) => `Username ${value} is already taken!`),
        check('password')
          .isString()
          .withMessage('Password must be a string!')
          .custom((password, { req }) => {
            // Custom length check, as password can be optional if the user already exists
            if (req.body.id === 'add' && password.length < 3) return false
            else if (password.length > 0 && password.length < 3) return false
            return true
          })
          .withMessage('Password needs to be at least 3 chars long!'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => shortid.isValid(id) || id === 'add')
          .withMessage('ID does not seem to be in the right format!')
          .custom((id) => {
            if (id !== 'add') {
              const existingUser = db.find({ id }).value()
              if (!existingUser) return false
            }
            return true
          })
          .withMessage('User was not found in database!')
      ]
    case 'deleteUser':
      return [
        ...validateUser('admin'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => {
            const existingUser = db.find({ id }).value()
            if (!existingUser) throw new Error('User was not found in database!')
            if (existingUser.isOriginal === true) throw new Error('User may not be deleted!')
            return true
          })
      ]
    default:
      return []
  }
}

export const validationHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).send({
      success: false,
      errors: errors.array()
    })
  } else next()
}

class UserController {
  constructor () {
    this.db = DatabaseController.getDatabase('users')
  }

  requestUser = (req, res) => {
    const data = this.getUser(req.query.id)
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'User successfully requested.',
        data
      })
    } else {
      return res.status(410).send({
        success: false,
        message: 'The requested user was not found!'
      })
    }
  }

  requestAllUsers = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Users successfully requested.',
      data: this.getAllUsers()
    })
  }

  requestAllUsernames = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Users successfully requested.',
      data: this.db.map(({ username }) => { return username }).value()
    })
  }

  requestSaveUser = (req, res) => {
    const {
      id,
      username,
      password,
      isAdmin,
      modifyPresets,
      createPresets,
      createConfigs
    } = req.body

    /**
     * Adding a user if ID === add
     */
    if (id === 'add') {
      const newId = shortid.generate()

      this.db.push({
        id: newId,
        username,
        password: this.hashPassword(password),
        executePresets: true,
        isOriginal: false,
        isAdmin: (typeof isAdmin === 'boolean') ? isAdmin : false,
        modifyPresets: (typeof modifyPresets === 'boolean') ? modifyPresets : false,
        createPresets: (typeof createPresets === 'boolean') ? createPresets : false,
        createConfigs: (typeof createConfigs === 'boolean') ? createConfigs : false
      }).write()

      return res.status(201).send({
        success: true,
        message: 'User successfully added!',
        data: req.body,
        newId
      })
    }

    const existingUser = this.db.find({ id })
    const existingUserVal = existingUser.value()

    existingUser.assign({
      username,
      password: (password.length > 0) ? this.hashPassword(password) : existingUserVal.password,
      isAdmin: existingUserVal.isOriginal || (typeof isAdmin === 'boolean') ? isAdmin : existingUserVal.isAdmin,
      modifyPresets: existingUserVal.isOriginal || (typeof modifyPresets === 'boolean') ? modifyPresets : existingUserVal.modifyPresets,
      createPresets: existingUserVal.isOriginal || (typeof createPresets === 'boolean') ? createPresets : existingUserVal.createPresets,
      createConfigs: existingUserVal.isOriginal || (typeof createConfigs === 'boolean') ? createConfigs : existingUserVal.modifcreateConfigsyConfigs
    }).write()

    return res.status(201).send({
      success: true,
      message: 'User successfully saved!',
      data: req.body
    })
  }

  requestDeleteUser = (req, res) => {
    const { id } = req.body
    this.db.remove({ id }).write()

    return res.status(201).send({
      success: true,
      message: 'User successfully removed!'
    })
  }

  requestLogin = (passport) => (req, res, next) => passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: err.toString()
      })
    }

    if (!user) {
      return res.status(402).send({
        success: false,
        message: info.message || 'Invalid credentials.'
      })
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send({
          success: true,
          message: err.toString()
        })
      }

      return res.redirect('./getLoginInformation')
    })
  })(req, res, next)

  requestLogout = (passport) => (req, res, next) => {
    req.logout()
    return res.status(200).send({
      success: true,
      message: 'Successfully logged out!'
    })
  }

  requestCurrentUser = (req, res, next) => {
    return res.status(200).send({
      success: true,
      message: 'Successfully requested!',
      data: req.user
    })
  }

  configurePassport = (passport) => {
    // Passport serializes and deserializes user instances to and from the session.
    // only the user ID is serialized and added to the session
    passport.serializeUser((user, done) => {
      done(null, user.id)
    })

    // for every request, the id is used to find the user, which will be restored
    // to req.user.
    passport.deserializeUser((id, done) => {
      // find user in database
      var user = this.db.find({ id }).value()

      if (typeof user === 'undefined' || !user) {
        done({ message: 'Invalid credentials.' }, null)
      } else {
        const { id, username, executePresets, modifyPresets, createPresets, createConfigs, isAdmin } = user
        // the object is what will be available for 'request.user'
        done(null, {
          id,
          username,
          rights: {
            executePresets: executePresets || false,
            modifyPresets: modifyPresets || false,
            createPresets: createPresets || false,
            createConfigs: createConfigs || false,
            isAdmin: isAdmin || false
          }
        })
      }
    })

    passport.use(new Strategy(
      (username, password, done) => {
        var user = this.db.find({ username }).value()

        // if user not found, return error
        if (!user) {
          return done(null, false, { message: 'Invalid username & password.' })
        }

        // check if password matches
        var passwordsMatch = this.comparePassword(password, user.password)
        if (!passwordsMatch) {
          return done(null, false, { message: 'Invalid username & password.' })
        }

        return done(null, user)
      }
    ))
  }

  hashPassword = (plainPassword) => hashSync(plainPassword, genSaltSync(10))
  comparePassword = (plainPassword, hashPassword) => compareSync(plainPassword, hashPassword)

  getAllUsers = () => {
    return this.db.map(({ username, id, isAdmin, lastLoggedIn }) => { return { username, id, isAdmin, lastLoggedIn } }).value()
  }

  getUser = (id = '') => {
    const user = this.db.find({ id }).value()
    if (user) {
      const userObj = { ...user }
      delete userObj.password
      return userObj
    }

    return user
  }
}

const userController = new UserController()
export default userController
