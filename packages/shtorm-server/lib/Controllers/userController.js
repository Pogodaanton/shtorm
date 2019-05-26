import DatabaseController from './databaseController'
import shortid from 'shortid'

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
      data: this.db.map(({ name }) => { return name }).value()
    })
  }

  requestSaveUser = (req, res) => {
    const {
      id,
      name,
      password,
      isAdmin,
      modifyPresets,
      createPresets
    } = req.body

    if (!name || typeof name !== 'string' || !id || typeof id !== 'string') {
      return res.status(400).send({
        success: false,
        message: 'Name and id must not be empty!'
      })
    }

    const existingUser = this.db.find({ id })
    const existingUsername = this.db.find({ name }).value()
    const existingUserVal = existingUser.value()

    if (existingUsername) {
      return res.status(400).send({
        success: false,
        message: 'This username is already taken!'
      })
    }

    /**
     * Adding a user if ID === add
     */
    if (id === 'add') {
      const newId = shortid.generate()
      if (typeof password !== 'string') {
        return res.status(400).send({
          success: false,
          message: 'The password is not typeof string!'
        })
      }

      this.db.unshift({
        id: newId,
        name,
        password,
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

    if (!existingUserVal) {
      return res.status(400).send({
        success: false,
        message: 'This user does not exist!'
      })
    }

    existingUser.assign({
      name,
      password: (typeof isAdmin === 'string') ? password : existingUserVal.password,
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

  requestDeleteUser = (req, res) => {
    const { id } = req.body

    if (!id) {
      return res.status(400).send({
        success: false,
        message: 'ID is required!'
      })
    }

    const user = this.getUser(id).value()
    if (!user) {
      return res.status(410).send({
        success: false,
        message: 'User was not found in database!'
      })
    }

    if (user.isOriginal === true) {
      return res.status(400).send({
        success: false,
        message: 'User may not be deleted!'
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

  getAllUsers = () => {
    return this.db.map(({ name, id, isAdmin, lastLoggedIn }) => { return { name, id, isAdmin, lastLoggedIn } }).value()
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
