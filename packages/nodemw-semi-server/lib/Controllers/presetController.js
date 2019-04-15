import DatabaseController from './databaseController'
import ScriptController from './scriptController'
import configController from './configController'

class PresetController {
  constructor () {
    this.db = DatabaseController.getDatabase('presets')
  }

  requestPreset = (req, res) => {
    const data = this.getPreset(req.query.name)
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'Preset successfully requested.',
        data
      })
    } else {
      return res.status(410).send({
        success: false,
        message: 'The requested preset was not found!'
      })
    }
  }

  requestAllPresets = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Presets successfully requested.',
      data: {
        presets: this.getAllPresets(),
        scripts: ScriptController.getAllScripts()
      }
    })
  }

  requestSavePreset = (req, res) => {
    let { key, preset } = req.body

    if (typeof preset !== 'object') {
      return res.status(400).send({
        success: false,
        message: 'Preset is required or is in wrong format!'
      })
    }

    if (!preset.name) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    if (!key) key = preset.name
    if (!preset.config) {
      return res.status(400).send({
        success: false,
        message: 'Config is required!'
      })
    }

    const { config: configName } = preset
    const config = configController.getConfig(configName)
    if (!config) {
      return res.status(400).send({
        success: false,
        message: 'Given config does not exist!'
      })
    }
    const favicon = this.getFaviconUrl(config)
    const existingPreset = this.db.find({ name: key })

    if (!existingPreset.value()) this.db.unshift({ ...preset, favicon }).write()
    else existingPreset.assign({ ...preset, favicon }).write()

    return res.status(201).send({
      success: true,
      message: 'Preset successfully saved!',
      data: req.body
    })
  }

  requestDeletePreset = (req, res) => {
    const { name } = req.body

    if (!name) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    if (!this.getPreset(name)) {
      return res.status(410).send({
        success: false,
        message: 'Name not found in database!'
      })
    }

    this.db
      .remove({ name })
      .write()

    return res.status(201).send({
      success: true,
      message: 'Preset successfully removed!'
    })
  }

  getFaviconUrl = ({ server }) => {
    return `https://www.google.com/s2/favicons?domain=${server}`
  }

  getAllPresets = () => {
    return this.db.map(({ favicon, name, script, config }) => { return { favicon, name, script, config } }).value()
  }

  getPreset = (name = '') => {
    return this.db.find({ name }).value()
  }
}

const presetController = new PresetController()
export default presetController
