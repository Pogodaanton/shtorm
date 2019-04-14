import DatabaseController from './databaseController'
import ScriptController from './scriptController'

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
    const { key, preset } = req.body

    if (typeof preset !== 'object') {
      return res.status(400).send({
        success: false,
        message: 'Preset is required or is in wrong format!'
      })
    }

    if (!preset.name || !key) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    const existingPreset = this.db.find({ name: key })

    if (!existingPreset.value()) this.db.unshift(preset).write()
    else existingPreset.assign(preset).write()

    return res.status(201).send({
      success: true,
      message: 'Preset successfully saved!',
      data: req.body
    })
  }

  requestDeletePreset = (req, res) => {
    const { key } = req.body

    if (!key) {
      return res.status(400).send({
        success: false,
        message: 'Name is required!'
      })
    }

    if (!this.getPreset(key)) {
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
      message: 'Preset successfully removed!'
    })
  }

  getAllPresets = () => {
    return this.db.map(({ name, logo, presetName }) => { return { name, logo, presetName } }).value()
  }

  getPreset = (name = '') => {
    return this.db.find({ name }).value()
  }
}

const presetController = new PresetController()
export default presetController
