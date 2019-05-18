import presetController from './presetController'
import shortid from 'shortid'
import cp from 'child_process'
import path from 'path'

class Script {
  constructor (client, config, scriptName, scriptOptions = {}) {
    this.config = config
    this.scriptName = scriptName
    this.scriptOptions = scriptOptions
    this.clientObj = null

    this.childProcess = cp.fork(path.join(__dirname, '../executeScript.js'), [scriptName], { stdio: 'pipe' })
    this.childProcess.on('message', this.messageHandler)
    this.childProcess.on('exit', this.exitHandler)
    this.childProcess.stdout.on('data', this.emitConsole('DEBUG'))
    this.childProcess.stderr.on('data', this.emitConsole('ERROR'))

    this.setClient(client)
    this.childProcess.send({ type: 'options', data: { config, scriptOptions } })
  }

  messageHandler = ({ type, data }) => {
    if (typeof type !== 'string') return
    switch (type) {
      case 'progress':
        this.clientObj = data
        this.emitProgress()
        break

      default:
        break
    }
  }

  dialogHandler = (isRejected) => (newText) => this.childProcess.send({ type: 'dialog', data: { isRejected, newText } })
  emitProgress = () => this.clientObj !== null && this.client.emit('script.progress', this.clientObj)

  emitConsole = (type) => (data) => this.client.emit('log_message', {
    type,
    key: shortid.generate(),
    timestamp: new Date().getTime(),
    msg: `${data}`
  })

  stop = () => this.childProcess.kill()
  exitHandler = () => {
    console.log('Process killed.')
    scriptController.handleStop(this, this.client)
  }

  setClient = (client) => {
    if (typeof client === 'undefined') return
    if (typeof this.client !== 'undefined') {
      this.client.off('script.dialog.resolve', this.dialogHandler(false))
      this.client.off('script.dialog.reject', this.dialogHandler(true))
      this.client.emit('client.disconnect')
    }

    this.client = client
    this.client.on('script.dialog.resolve', this.dialogHandler(false))
    this.client.on('script.dialog.reject', this.dialogHandler(true))

    this.emitProgress()
  }

  getScriptExecutionData = () => {
    if (this.clientObj !== null) {
      const { progress, scriptName, finished } = this.clientObj
      return { progress, scriptName, finished }
    } else return null
  }
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
    if (proc) proc.stop()
    else client.emit('script.stop.error', `Process ${uuid} does not exist!`)
  }

  handleStop = (task, client) => {
    const index = Object.values(this.tasks).findIndex((t) => t === task)
    const uuid = Object.keys(this.tasks)[index]
    delete this.tasks[uuid]
    client.emit('script.stop', true)
  }

  getTasks = (client) => {
    const tasks = Object.keys(this.tasks).map((uuid) => {
      const scriptExecutionData = this.tasks[uuid].getScriptExecutionData()
      if (scriptExecutionData !== null) return { uuid, ...scriptExecutionData }
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
