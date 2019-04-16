import fs from 'fs'
import path from 'path'
import presetController from './presetController'
import shortid from 'shortid'

const scriptsFolder = path.join(__dirname, '../../scripts')
class Script {
  bot = null
  constructor (client, config, scriptName, scriptOptions = {}) {
    this.client = client
    this.config = config
    this.scriptName = scriptName
    this.scriptOptions = scriptOptions

    this.initBot()
  }

  initBot = () => {
    this.client.emit('script.progress', 10)
  }

  getAllScripts = () => {
    return fs.readdirSync(scriptsFolder).map((name) => name.slice(-3) === '.js' && name)
  }

  stop = () => console.log('Händehoch!')
}

class ScriptController {
  processes = {}

  startScript = (name, client) => {
    try {
      const { preset, config } = presetController.getPreset(name)
      const scriptOptions = this.presetToScriptOptions(preset)
      const uuid = shortid.generate()

      this.processes[uuid] = new Script(client, config, preset.script, scriptOptions)
      client.emit('start.success', uuid)
    } catch (err) {
      console.error(err)
      client.emit('start.error', err)
    }
  }

  stopScript = (uuid, client) => {
    const proc = this.processes[uuid]
    if (proc) {
      proc.stop()
      this.processes[uuid] = null
      client.emit('stop.success')
    } else {
      client.emit('stop.error', `Process ${uuid} does not exist!`)
    }
  }

  presetToScriptOptions = (preset) => {
    delete preset.name
    delete preset.script
    delete preset.config
    delete preset.favicon
    return preset
  }
}

const scriptController = new ScriptController()
export default scriptController
