import DatabaseController from './databaseController'
import shortid from 'shortid'
import { hashSync, compareSync, genSaltSync } from 'bcryptjs'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { check, validationResult } from 'express-validator/check'

class AuthController {
  constructor () {
    this.db = DatabaseController.getDatabase('users')
  }

  requestLoginChecks = [
    check('username')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('Parameter username must not be empty!'),
    check('password')
      .exists({ checkFalsy: true, checkNull: true }).withMessage('Parameter password must not be empty!')
  ]

  requestLogin = (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).send({
        success: false,
        errors: errors.array()
      })
    }
  }

  hashPassword = (plainPassword) => {
    let salt = genSaltSync(10)
    return hashSync(plainPassword, salt)
  }

  comparePassword = (plainPassword, hashPassword) => compareSync(plainPassword, hashPassword)
}

const authController = new AuthController()
export default authController
