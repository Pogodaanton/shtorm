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
    const data = this.getConfig(req.query.id)
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

  getAllConfigs = () => {
    return this.db.get('configs').value()
  }

  getConfig = (configName = '') => {
    return this.db.get('configs').find({ key: configName }).value()
  }
}

const configController = new ConfigController()
export default configController
