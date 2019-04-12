import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

class ConfigController {
  constructor () {
    this.adapter = new FileSync('db/nodemw-configs.json')
    this.db = low(this.adapter)
    this.db.defaults({ configs: [] }).write()
  }

  requestPong = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Pong!',
      data: this.getAllConfigs()
    })
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
      return res.status(404).send({
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

    const configs = this.db.get('configs')
    const existingConfig = configs.find({ name: key })

    if (!existingConfig.value()) configs.unshift({ ...req.body }).write()
    else existingConfig.assign({ ...config }).write()

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

    this.db.get('configs')
      .remove({ name: key })
      .write()

    return res.status(201).send({
      success: true,
      message: 'Config successfully removed!'
    })
  }

  getAllConfigs = () => {
    return this.db.get('configs').map(({ name }) => { return { name, fromServer: true } }).value()
  }

  getConfig = (name = '') => {
    return this.db.get('configs').find({ name }).value()
  }
}

const configController = new ConfigController()
export default configController
