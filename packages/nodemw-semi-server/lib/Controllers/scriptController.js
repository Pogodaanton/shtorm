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
  progress = 0
  progressMessage = null
  finished = false

  constructor (client, config, scriptName, scriptOptions = {}) {
    this.client = client
    this.config = config
    this.scriptName = scriptName
    this.scriptOptions = scriptOptions

    this.initPrequesities()
  }

  initPrequesities = () => {
    this.client.emit('script.progress', 0)
    this.bot = new NodeMw({
      ...this.config,
      debug: true
    })
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
          this.setProgress(80)
          this.finished = true
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

  setProgress = (progress, progressMessage = null) => {
    if (typeof progress !== 'number') progress = 0
    if (typeof progressMessage === 'string') this.progressMessage = progressMessage
    this.progress = progress
    this.sendProgress()
  }

  sendProgress = () => {
    const { progress, progressMessage, finished } = this
    this.client.emit('script.progress', { progress, progressMessage, finished })
  }

  setClient = (client) => {
    if (typeof client === 'undefined') return
    this.client = client
    this.sendProgress()
  }

  getScriptExecutionData = () => {
    return {
      scriptName: this.scriptName,
      progress: this.progress
    }
  }

  stop = () => console.log('Händehoch!')
}

class ScriptController {
  tasks = {}

  startScript = (name, client) => {
    try {
      const { preset, config } = presetController.getPreset(name)
      if (preset && config) {
        const scriptOptions = this.presetToScriptOptions(preset)
        const uuid = shortid.generate()

        this.tasks[uuid] = new Script(client, config, preset.script, scriptOptions)
        client.emit('task.start.success', uuid)
      } else {
        throw new Error('No preset found with name ' + name)
      }
    } catch (err) {
      console.error(err)
      client.emit('task.start.error', err)
    }
  }

  stopScript = (uuid, client) => {
    const proc = this.tasks[uuid]
    if (proc) {
      proc.stop()
      this.tasks[uuid] = null
      client.emit('stop.success')
    } else {
      client.emit('stop.error', `Process ${uuid} does not exist!`)
    }
  }

  getTasks = (client) => {
    const tasks = Object.keys(this.tasks).map((uuid) => {
      const scriptExecutionData = this.tasks[uuid].getScriptExecutionData()
      return { uuid, ...scriptExecutionData }
    })
    client.emit('tasks.update', tasks)
  }

  setClientToTask = (uuid, client) => {
    const task = this.tasks[uuid]
    if (!task) {
      client.emit('task.request.error', `Process ${uuid} does not exist!`)
      return
    }
    task.setClient(client)
    client.emit('task.request.success')
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
