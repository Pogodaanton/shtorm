import DatabaseController from './databaseController'
import shortid from 'shortid'
import { hashSync, compareSync, genSaltSync } from 'bcryptjs'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { check, validationResult } from 'express-validator/check'

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
    if (req.user) {
      return res.status(200).send({
        success: true,
        message: 'Users successfully requested.',
        data: this.getAllUsers()
      })
    } else {
      return res.status(401).send({
        success: false,
        message: 'You need to login first.'
      })
    }
  }

  requestAllUsernames = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Users successfully requested.',
      data: this.db.map(({ username }) => { return username }).value()
    })
  }

  requestSaveUserChecks = [
    check('username')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('Name is required!')
      .isString().withMessage('Name must be a string!')
      .isLength({ min: 3 }).withMessage('Name needs to be at least 3 chars long!')
      .custom((username, { req }) => {
        // Custom check for the availability of the username
        const { id } = req.body
        const existingUsername = this.db.find({ username }).value()
        if (existingUsername && existingUsername.id !== id) return false
        return true
      }).withMessage((value) => `Username ${value} is already taken!`),
    check('password')
      .isString().withMessage('Password must be a string!')
      .custom((password, { req }) => {
        // Custom length check, as password can be optional if the user already exists
        if (req.body.id === 'add' && password.length < 3) return false
        else if (password.length > 0 && password.length < 3) return false
        return true
      }).withMessage('Password needs to be at least 3 chars long!'),
    check('id')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('ID is required!')
      .isString().withMessage('ID must be a string!')
      .custom((id) => shortid.isValid(id) || id === 'add').withMessage('ID does not seem to be in the right format!')
      .custom((id) => {
        if (id !== 'add') {
          const existingUser = this.db.find({ id }).value()
          if (!existingUser) return false
        }
        return true
      }).withMessage('User was not found in database!')
  ]

  requestSaveUser = (req, res) => {
    const errors = validationResult(req)
    const {
      id,
      username,
      password,
      isAdmin,
      modifyPresets,
      createPresets
    } = req.body

    if (!errors.isEmpty()) {
      return res.status(422).send({
        success: false,
        errors: errors.array()
      })
    }

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
        createPresets: (typeof createPresets === 'boolean') ? createPresets : false
      }).write()

      return res.status(201).send({
        success: true,
        message: 'User successfully saved!',
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
      createPresets: existingUserVal.isOriginal || (typeof createPresets === 'boolean') ? createPresets : existingUserVal.createPresets
    }).write()

    return res.status(201).send({
      success: true,
      message: 'User successfully saved!',
      data: req.body
    })
  }

  requestDeleteUserChecks = [
    check('id')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('ID is required!')
      .isString().withMessage('ID must be a string!')
      .custom((id) => {
        const existingUser = this.db.find({ id }).value()
        if (!existingUser) throw new Error('User was not found in database!')
        if (existingUser.isOriginal === true) throw new Error('User may not be deleted!')
        return true
      })
  ]

  requestDeleteUser = (req, res) => {
    const errors = validationResult(req)
    const { id } = req.body

    if (!errors.isEmpty()) {
      return res.status(422).send({
        success: false,
        errors: errors.array()
      })
    }

    this.db
      .remove({ id })
      .write()

    return res.status(201).send({
      success: true,
      message: 'User successfully removed!'
    })
  }

  requestLoginChecks = [
    check('username')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('Parameter username must not be empty!'),
    check('password')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('Parameter password must not be empty!')
  ]

  requestLoginRedirection = (passport) => (req, res, next) => passport.authenticate('local', {
    successRedirect: '/api/v1/getAllScripts',
    failureRedirect: '/api/v1/getAllUsers'
  })(req, res, next)

  requestLoginAsync = (passport) => (req, res, next) => passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).send({
        success: true,
        message: err.toString()
      })
    }

    if (!user) {
      return res.status(402).send({
        success: true,
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

      return res.status(200).send({
        success: true,
        message: 'Successfully logged in!'
      })
    })
  })(req, res, next)

  requestLogin = (passport) => (req, res, next) => passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).send({
        success: true,
        message: err.toString()
      })
    }

    if (!user) {
      return res.status(402).send({
        success: true,
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

      return res.redirect('/api/v1/getUser?id=' + req.user.id)
    })
  })(req, res, next)

  requestLogout = (passport) => (req, res, next) => {
    req.logout()
    res.redirect('/api/v1/getAllUsers')
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

      if (!user) {
        done({ message: 'Invalid credentials.' }, null)
      } else {
        // the object is what will be available for 'request.user'
        done(null, { id: user.id, username: user.username })
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

  getAllUsers = () => {
    return this.db.map(({ username, id, isAdmin, lastLoggedIn }) => { return { username, id, isAdmin, lastLoggedIn } }).value()
  }

  hashPassword = (plainPassword) => hashSync(plainPassword, genSaltSync(10))
  comparePassword = (plainPassword, hashPassword) => compareSync(plainPassword, hashPassword)

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
