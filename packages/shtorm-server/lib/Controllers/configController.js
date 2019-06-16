import DatabaseController from './databaseController'
import { validateUser } from './userController'
import { check } from 'express-validator/check'
import shortid from 'shortid'

const db = DatabaseController.getDatabase('configs')

export const validateConfig = (type) => {
  switch (type) {
    case 'getConfig':
      return [
        ...validateUser('createConfigs'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
      ]
    case 'saveConfig':
      return [
        ...validateUser('createConfigs'),
        check('name')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('Name is required!')
          .isString()
          .withMessage('Name must be a string!')
          .isLength({ min: 3 })
          .withMessage('Name needs to be at least 3 chars long!')
          .custom((name, { req }) => {
            // Custom check for the availability of the username
            const { id } = req.body
            const existingName = db.find({ name }).value()
            if (existingName && existingName.id !== id) return false
            return true
          })
          .withMessage((value) => `Name ${value} is already taken!`),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => shortid.isValid(id) || id === 'add')
          .withMessage('ID does not seem to be in the right format!')
          .custom((id) => {
            if (id !== 'add') {
              const existingConfig = db.find({ id }).value()
              if (!existingConfig) return false
            }
            return true
          })
          .withMessage('Config was not found in database!')
      ]
    case 'deleteConfig':
      return [
        ...validateUser('createConfigs'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => {
            const existingConfig = db.find({ id }).value()
            if (!existingConfig) throw new Error('Config was not found in database!')
            return true
          })
      ]
    default:
      return []
  }
}

class ConfigController {
  requestConfig = (req, res) => {
    const data = this.getConfig(req.query.id)
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'Config successfully requested.',
        data
      })
    } else {
      return res.status(410).send({
        success: false,
        message: 'The requested config was not found!'
      })
    }
  }

  requestAllConfigs = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Configs successfully requested.',
      data: this.getAllConfigs()
    })
  }

  requestAllConfigNames = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Names successfully requested.',
      data: db.map(({ name }) => { return name }).value()
    })
  }

  requestSaveConfig = (req, res) => {
    const {
      id,
      name,
      protocol,
      server,
      path,
      debug,
      username,
      password,
      domain,
      userAgent,
      concurrency
    } = req.body

    if (id === 'add') {
      const newId = shortid.generate()

      db.push({
        id: newId,
        name,
        protocol: typeof protocol === 'string' ? protocol : 'https',
        server: typeof server === 'string' ? server : '',
        path: typeof path === 'string' ? path : '',
        debug: typeof debug === 'boolean' ? debug : false,
        username: typeof username === 'string' ? username : '',
        password: typeof password === 'string' ? password : '',
        domain: typeof domain === 'string' ? domain : '',
        userAgent: typeof userAgent === 'string' ? userAgent : '',
        concurrency: (typeof concurrency === 'number' && concurrency > 0) ? concurrency : 3
      }).write()

      return res.status(201).send({
        success: true,
        message: 'Config successfully added!',
        data: req.body,
        newId
      })
    }

    const existingConfig = db.find({ id })
    const existingConfigVal = existingConfig.value()

    existingConfig.assign({
      name,
      protocol: (typeof protocol === 'string') ? protocol : existingConfigVal.protocol,
      server: (typeof server === 'string') ? server : existingConfigVal.server,
      path: (typeof path === 'string') ? path : existingConfigVal.path,
      debug: (typeof debug === 'boolean') ? debug : existingConfigVal.debug,
      username: (typeof username === 'string') ? username : existingConfigVal.username,
      password: (typeof password === 'string') ? password : existingConfigVal.password,
      domain: (typeof domain === 'string') ? domain : existingConfigVal.domain,
      userAgent: (typeof userAgent === 'string') ? userAgent : existingConfigVal.userAgent,
      concurrency: (typeof concurrency === 'number') ? concurrency : existingConfigVal.concurrency
    }).write()

    return res.status(201).send({
      success: true,
      message: 'Config successfully saved!',
      data: req.body
    })
  }

  requestDeleteConfig = (req, res) => {
    const { id } = req.body
    db.remove({ id }).write()

    return res.status(201).send({
      success: true,
      message: 'Config successfully removed!'
    })
  }

  getFavicon = (server) => {
    return `https://proxy.duckduckgo.com/ip3/${server}.ico`
  }

  getFaviconFromConfig = (configName) => {
    let { server } = (this.getConfig(configName) || {})
    if (typeof server !== 'string') server = '404'
    return this.getFavicon(server)
  }

  getAllConfigs = () => {
    return db.map(({ id, name, server }) => { return { id, name, favicon: this.getFavicon(server) } }).value()
  }

  getConfig = (id) => {
    return db.find({ id }).value()
  }
}

const configController = new ConfigController()
export default configController
