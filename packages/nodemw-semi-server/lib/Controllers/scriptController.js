import presetController from './presetController'
import shortid from 'shortid'
import NodeMw from 'nodemw'
import Promise from 'bluebird'
import path from 'path'
import { transformFile } from '@babel/core'
import { VM } from 'vm2'

const scriptsFolder = path.join(__dirname, '../../scripts')
class Script {
  bot = null
  constructor (client, config, scriptName, scriptOptions = {}) {
    this.client = client
    this.config = config
    this.scriptName = scriptName
    this.scriptOptions = scriptOptions

    this.initPrequesities()
  }

  initPrequesities = () => {
    this.client.emit('script.progress', 0)
    this.bot = new NodeMw(this.config)
    Promise.promisifyAll(this.bot)

    this.vm = new VM({
      console: 'inherit',
      sandbox: { exports: {} },
      require: {
        external: true,
        builtin: ['lowdb'],
        root: './'
      }
    })

    transformFile(path.join(scriptsFolder, this.scriptName), (err, data) => {
      if (err) {
        console.error('Failed to load and transpile script', err)
        this.client.emit('start.error', err)
        return
      }

      const { code } = data
      if (typeof this.vm.run(code) !== 'function') {
        const errMsg = 'Failed to load script: Export.default needs to be a function that returns a Promise!'
        console.error(errMsg)
        this.client.emit('start.error', errMsg)
        return
      }

      this.code = code
      this.executeScript()
    })
  }

  executeScript = () => {
    try {
      this.vm.run(this.code)(this.bot, {}, this.scriptOptions)
        .then(() => {
          console.log('yaaay, finished!')
          this.client.emit('script.progress', 100)
          this.client.emit('script.success')
        })
        .catch((err) => {
          console.error('Failed to successfully execute the script.', err)
          this.client.emit('script.error', err)
        })
    } catch (err) {
      console.error('Failed to execute the script.', err)
      this.client.emit('script.error', err)
    }
  }

  stop = () => console.log('Händehoch!')
}

class ScriptController {
  processes = {}

  startScript = (name, client) => {
    try {
      const { preset, config } = presetController.getPreset(name)
      if (preset && config) {
        const scriptOptions = this.presetToScriptOptions(preset)
        const uuid = shortid.generate()

        this.processes[uuid] = new Script(client, config, preset.script, scriptOptions)
        client.emit('start.success', uuid)
      } else {
        throw new Error('No preset found with name ' + name)
      }
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
    const newPreset = { ...preset } // Needs to be done, so that we don't mutate lowdb...
    delete newPreset.name
    delete newPreset.script
    delete newPreset.config
    delete newPreset.favicon
    return newPreset
  }
}

const scriptController = new ScriptController()
export default scriptController
