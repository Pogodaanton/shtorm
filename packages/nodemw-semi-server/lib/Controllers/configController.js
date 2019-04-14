import DatabaseController from './databaseController'

class ConfigController {
  constructor () {
    this.db = DatabaseController.getDatabase('configs')
  }

  requestConfig = (req, res) => {
    const data = this.getConfig(req.query.name)
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

  requestSaveConfig = (req, res) => {
    const { key, config } = req.body

    if (typeof config !== 'object') {
      return res.status(400).send({
        success: false,
        message: 'Config is required or is in wrong format!'
      })
    }

    if (!config.name || !key) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    const existingConfig = this.db.find({ name: key })

    if (!existingConfig.value()) this.db.unshift(config).write()
    else existingConfig.assign(config).write()

    return res.status(201).send({
      success: true,
      message: 'Config successfully saved!',
      data: req.body
    })
  }

  requestDeleteConfig = (req, res) => {
    const { key } = req.body

    if (!key) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    if (!this.getConfig(key)) {
      return res.status(410).send({
        success: false,
        message: 'Name not found in database!'
      })
    }

    this.db
      .remove({ name: key })
      .write()

    return res.status(201).send({
      success: true,
      message: 'Config successfully removed!'
    })
  }

  getAllConfigs = () => {
    return this.db.map(({ name }) => { return { name, fromServer: true } }).value()
  }

  getConfig = (name = '') => {
    return this.db.find({ name }).value()
  }
}

const configController = new ConfigController()
export default configController
