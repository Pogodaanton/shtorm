import presetController from './presetController'
import shortid from 'shortid'
import cp from 'child_process'
import path from 'path'

class Script {
<<<<<<< HEAD
=======
  bot = null
  progress = 0
  progressText = null
  finished = false
  dialog = {}

  scriptDialogResolveFunction = null
  scriptDialogRejectFunction = null

>>>>>>> refs/remotes/origin/master
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

<<<<<<< HEAD
    this.setClient(client)
    this.childProcess.send({ type: 'options', data: { config, scriptOptions } })
  }

  messageHandler = ({ type, data }) => {
    if (typeof type !== 'string') return
    switch (type) {
      case 'progress':
        this.clientObj = data
=======
  initPrequesities = () => {
    this.client.emit('script.progress', 0)
    this.bot = new NodeMw({
      ...this.config,
      debug: true
    })
    Promise.promisifyAll(this.bot)

    this.vm = new VM({
      sandbox: {
        exports: {},
        updateClient: this.updateClient,
        bot: this.bot,
        clientOptions: this.scriptOptions,
        console
      },
      require: {
        external: true,
        builtin: ['lowdb'],
        root: './'
      }
    })

    transformFile(path.join(scriptsFolder, this.scriptName), (err, data) => {
      if (err) {
        console.error('Failed to load and transpile script', err)
        this.client.emit('script.error', err)
        return
      }

      const { code } = data
      if (typeof this.vm.run(code).default !== 'function') {
        const errMsg = 'Failed to load script: exports.default needs to be a function that returns a Promise!'
        console.error(errMsg)
        this.client.emit('script.error', errMsg)
        return
      }

      this.code = code
      this.executeScript()
    })
  }

  executeScript = () => {
    try {
      this.vm.run(this.code).default(this.scriptOptions)
        .then(() => {
          this.finished = true
          this.updateClient({ progress: 100, progressText: 'Script executed successfully.', dialog: {} })
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

  updateClient = (updateObj) => {
    if (typeof updateObj !== 'object') {
      console.error('Function "updateClient" requires an "Object" as argument.')
      return new Promise((resolve) => resolve)
    }

    const { progress, progressText, dialog } = updateObj
    if (typeof progress === 'number') this.progress = progress
    if (typeof progressText === 'string') this.progressText = progressText
    if (typeof dialog === 'object') {
      return new Promise((resolve, reject) => {
        this.dialog = dialog
        this.scriptDialogResolveFunction = resolve
        this.scriptDialogRejectFunction = reject

>>>>>>> refs/remotes/origin/master
        this.emitProgress()
        break

      default:
        break
    }
  }

  emitProgress = () => this.clientObj !== null && this.client.emit('script.progress', this.clientObj)
  dialogHandler = (isRejected) => (newText) => {
    if (!this.childProcess.killed) this.childProcess.send({ type: 'dialog', data: { isRejected, newText } })
  }

<<<<<<< HEAD
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
=======
  emitProgress = () => {
    const { progress, progressText, finished, dialog } = this
    this.client.emit('script.progress', { progress, progressText, finished, dialog })
>>>>>>> refs/remotes/origin/master
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
    const obj = this.clientObj || {}
    return {
      progress: obj.progress || 0,
      scriptName: this.scriptName,
      finished: obj.finished || false
    }
  }
}

class ScriptController {
  tasks = {}

  startProcess = (name, client) => {
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

  killProcess = (uuid, client) => {
    const proc = this.tasks[uuid]
    if (proc) proc.stop()
    else client.emit('task.kill.error', `Process ${uuid} does not exist!`)
  }

  handleStop = (task, client) => {
    const index = Object.values(this.tasks).findIndex((t) => t === task)
    const uuid = Object.keys(this.tasks)[index]
    delete this.tasks[uuid]
    client.emit('task.killed', true)
    this.getProcesses(client)
  }

  getProcesses = (client) => {
    const tasks = Object.keys(this.tasks).map((uuid) => {
      const scriptExecutionData = this.tasks[uuid].getScriptExecutionData()
      return { uuid, ...scriptExecutionData }
    })
    client.emit('tasks.update', tasks)
  }

  setClientToProcess = (uuid, client) => {
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
