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

  _checkCallback = (permission, verbose = false) => (req) => {
    if (!req.user) {
      if (verbose) throw new Error(this._logInMessage)
      else return false
    }

    if (typeof permission === 'string' && req.user.permissions[permission] === false) {
      if (verbose) throw new Error(this._notPermittedMessage)
      else return false
    }

    return true
  }

  _checkOneOfCallback = (permissions, verbose = false) => (req) => {
    let permittedRights = 0
    if (!req.user) {
      if (verbose) throw new Error(this._logInMessage)
      else return false
    }

    if (Array.isArray(permissions)) {
      permissions.forEach((permission) => {
        if (req.user.permissions[permission] === true) permittedRights++
      })
      if (permittedRights === 0) {
        if (verbose) throw new Error(this._notPermittedMessage)
        else return false
      }
    }
    return true
  }

  _checkAllOfCallback = (permissions, verbose = false) => (req) => {
    let permittedRights = 0
    if (!req.user) {
      if (verbose) throw new Error(this.logInMessage)
      else return false
    }

    if (Array.isArray(permissions)) {
      permissions.forEach((permission) => {
        if (req.user.permissions[permission] === true) permittedRights++
      })
      if (permittedRights < permissions.length) {
        if (verbose) throw new Error(this.notPermittedMessage)
        else return false
      }
    }
    return true
  }

  check = (permission) => this._baseCheck(this._checkCallback(permission, true))
  checkOneOf = (permissions) => this._baseCheck(this._checkOneOfCallback(permissions, true))
  checkAllOf = (permissions) => this.baseCheck(this._checkAllOfCallback(permissions, true))

  has = (permission, req, verbose = false) => this._checkCallback(permission, verbose)(req)
  hasOneOf = (permission, req, verbose = false) => this._checkOneOfCallback(permission, verbose)(req)
  hasAllOf = (permission, req, verbose = false) => this._checkAllOfCallback(permission, verbose)(req)
}

export const permission = new Permission()
export const validateUser = (type) => {
  switch (type) {
    case 'admin':
      return [ permission.checkOneOf(['isAdmin', 'isOriginal']) ]
    case 'executeProjects':
      return [ permission.checkOneOf(['executeProjects', 'isAdmin', 'isOriginal']) ]
    case 'createProjects':
      return [ permission.checkOneOf(['createProjects', 'isAdmin', 'isOriginal']) ]
    case 'assignProjects':
      return [ permission.checkOneOf(['assignProjects', 'isAdmin', 'isOriginal']) ]
    case 'seeAllProjects':
      return [ permission.checkOneOf(['seeAllProjects', 'isAdmin', 'isOriginal']) ]
    case 'viewConfigs':
      return [ permission.checkOneOf(['createConfigs', 'createProjects', 'isAdmin', 'isOriginal']) ]
    case 'createConfigs':
      return [ permission.checkOneOf(['createConfigs', 'isAdmin', 'isOriginal']) ]
    case 'editOneself':
      return [
        body('permission')
          // Custom permission function to check whether the user is acquiring his own informations
          .custom((val, { req }) => {
            if (req.user.id === req.query.id || req.body.id === req.user.id) return true
            return permission._checkOneOfCallback(['isAdmin', 'isOriginal'])(req)
          })
      ]
    case 'getUser':
      return [
        ...validateUser('editOneself'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true }).withMessage('Missing paramter "id".')
          .isString().withMessage('Parameter "id" needs to be of type string!')
      ]
    case 'saveUser':
      return [
        ...validateUser('editOneself'),
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

export const deserializeUser = (id, done) => {
  // find user in database
  var user = db.find({ id }).value()

  if (typeof user === 'undefined' || !user) {
    done({ message: 'Invalid credentials.' }, null)
  } else {
    const {
      id,
      username,
      createProjects,
      assignProjects,
      seeAllProjects,
      createConfigs,
      isAdmin,
      isOriginal
    } = user
    // the object is what will be available for 'request.user'
    done(null, {
      id,
      username,
      permissions: {
        executeProjects: true,
        assignProjects: assignProjects || false,
        seeAllProjects: seeAllProjects || false,
        createProjects: createProjects || false,
        createConfigs: createConfigs || false,
        isAdmin: isOriginal || isAdmin || false
      }
    })
  }
}

class UserController {
  constructor () {
    this.db = db
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
      data: this.db.map(({ username, id, isAdmin }) => { return { username, id, isAdmin } }).value()
    })
  }

  requestSaveUser = (req, res) => {
    const {
      id,
      username,
      password,
      isAdmin,
      assignProjects,
      seeAllProjects,
      createProjects,
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
        executeProjects: true,
        isOriginal: false,
        isAdmin: (typeof isAdmin === 'boolean') ? isAdmin : false,
        assignProjects: (typeof assignProjects === 'boolean') ? assignProjects : false,
        seeAllProjects: (typeof seeAllProjects === 'boolean') ? seeAllProjects : false,
        createProjects: (typeof createProjects === 'boolean') ? createProjects : false,
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
    const canUserEditRights = req.user.permissions.isAdmin

    // Make sure that the user editing is also allowed to change permissions; All permissions need to be typeof boolean!
    const newRights = canUserEditRights ? {
      isAdmin: existingUserVal.isOriginal || (typeof isAdmin === 'boolean') ? isAdmin : existingUserVal.isAdmin,
      assignProjects: existingUserVal.isOriginal || (typeof assignProjects === 'boolean') ? assignProjects : existingUserVal.assignProjects,
      seeAllProjects: existingUserVal.isOriginal || (typeof seeAllProjects === 'boolean') ? seeAllProjects : existingUserVal.seeAllProjects,
      createProjects: existingUserVal.isOriginal || (typeof createProjects === 'boolean') ? createProjects : existingUserVal.createProjects,
      createConfigs: existingUserVal.isOriginal || (typeof createConfigs === 'boolean') ? createConfigs : existingUserVal.modifcreateConfigsyConfigs
    } : {}

    existingUser.assign({
      username,
      password: (password.length > 0) ? this.hashPassword(password) : existingUserVal.password,
      ...newRights
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

      return res.redirect('./whoami')
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
      data: req.user ? req.user : {}
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
    passport.deserializeUser(deserializeUser)

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

  getAllProjectAssignees = (projectId = '') => {
    const allUsers = this.db.value()
    const users = allUsers
      .filter((user) => {
        if (
          typeof user.assignments === 'object' &&
          user.assignments.findIndex((projectIdItem) => projectIdItem === projectId) > -1
        ) return true
        return false
      })
      .map(({ id, username, isAdmin }) => { return { id, username, isAdmin } })
    return users
  }

  setProjectAssignee = (projectId = '', assignee = {}, shouldDelete = false) => {
    const user = this.db.find({ id: assignee.id })
    if (user.value()) {
      const assignmentsSet = new Set(user.value().assignments || [])
      if (shouldDelete) assignmentsSet.delete(projectId)
      else assignmentsSet.add(projectId)
      user.assign({ assignments: Array.from(assignmentsSet) }).write()
    }
  }
}

const userController = new UserController()
export default userController
