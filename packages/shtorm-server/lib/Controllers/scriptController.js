import projectController from './projectController'
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

  emitProgress = () => this.clientObj !== null && this.client.emit('script.progress', this.clientObj)
  dialogHandler = (isRejected) => (newText) => {
    if (!this.childProcess.killed) this.childProcess.send({ type: 'dialog', data: { isRejected, newText } })
  }

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
      const { project, config } = projectController.getProject(name)
      if (project && config) {
        const scriptOptions = this.projectToScriptOptions(project)
        const uuid = shortid.generate()

        this.tasks[uuid] = new Script(client, config, project.script, scriptOptions)
        client.emit('task.start.success', uuid)
      } else {
        throw new Error('No project found with name ' + name)
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

  projectToScriptOptions = (project) => {
    const newProject = { ...project } // Needs to be done, so that we don't mutate lowdb...
    delete newProject.name
    delete newProject.script
    delete newProject.config
    delete newProject.favicon
    return newProject
  }
}

const scriptController = new ScriptController()
export default scriptController
