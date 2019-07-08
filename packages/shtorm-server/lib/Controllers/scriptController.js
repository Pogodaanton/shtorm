import projectController from './projectController'
import { permission } from './userController'
import configChecker from '../configChecker'
import shortid from 'shortid'
import cp from 'child_process'
import path from 'path'

class Script {
  constructor (client, config, scriptName, scriptOptions = {}, projectId = '') {
    this.config = config
    this.scriptName = scriptName
    this.scriptOptions = scriptOptions
    this.clientObj = null
    this.projectId = projectId

    this.childProcess = cp.fork(path.join(__dirname, '../executeScript.js'), [scriptName, configChecker().scriptsDirectory], { stdio: 'pipe' })
    this.childProcess.on('message', this.messageHandler)
    this.childProcess.on('exit', this.exitHandler)
    this.childProcess.stdout.on('data', this.emitConsole('DEBUG'))
    this.childProcess.stderr.on('data', this.emitConsole('ERROR'))

    this.setClient(client)
    this.childProcess.send({ type: 'options', data: { config, scriptOptions } })
  }

  messageHandler = ({ type, data }) => {
    console.log({ type, data })
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
    this.unsetClient()
    console.log('Process killed.')
    scriptController.handleStop(this, this.client)
  }

  unsetClient = () => {
    this.client.off('script.dialog.resolve', this.dialogHandler(false))
    this.client.off('script.dialog.reject', this.dialogHandler(true))
  }

  setClient = (client) => {
    if (typeof client === 'undefined') return
    if (typeof this.client !== 'undefined') {
      this.unsetClient()
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
  processes = {}

  checkLoggedIn = (req) => permission.has('executeProjects', req, true)
  checkProcessExecutionPermission = (req, projectId) => {
    this.checkLoggedIn(req)
    if (
      !permission.hasOneOf(['isAdmin', 'isOriginal', 'seeAllProjects'], req) &&
      !projectController.hasUserProjectAssigned(req.user.id, projectId)
    ) {
      throw new Error('You are not allowed to execute this project!')
    }
  }

  startProcess = ({ id, scriptOptions }, client) => {
    try {
      this.checkProcessExecutionPermission(client.request, id)

      const { project, config } = projectController.getProject(id)
      if (!project || !config) throw new Error('No project found with id ' + id)

      const pid = shortid.generate()
      this.processes[pid] = new Script(client, config, project.script, scriptOptions, project.id)
      client.emit('process.start.success', pid)
    } catch (err) {
      console.error(err)
      client.emit('process.start.error', err)
    }
  }

  handleStop = (processClass, client) => {
    const index = Object.values(this.processes).findIndex((p) => p === processClass)

    if (index > -1) {
      const pid = Object.keys(this.processes)[index]
      this.processes[pid].stop()
      delete this.processes[pid]
    }

    client.emit('process.killed', true)
    this.getProcesses(client)
  }

  getProcesses = (client) => {
    if (permission.hasOneOf(['isAdmin', 'isOriginal'], client.request)) {
      const processes = Object.keys(this.processes).map((pid) => {
        const scriptExecutionData = this.processes[pid].getScriptExecutionData()
        return { pid, ...scriptExecutionData }
      })
      client.emit('processes.update', processes)
    }
  }

  getProcess = (pid, client) => {
    const proc = this.processes[pid]
    if (!proc) {
      if (typeof client === 'object') client.emit('process.request.error', `Process ${pid} does not exist!`)
      return null
    }
    return proc
  }

  setClientToProcess = (pid, client) => {
    const proc = this.getProcess(pid, client)
    if (proc) {
      try {
        this.checkProcessExecutionPermission(client.request, proc.projectId)
        proc.setClient(client)
        client.emit('process.request.success')
      } catch (err) {
        console.error(err)
        client.emit('process.request.error', err)
      }
    }
  }

  unsetClientFromProcess = (pid, client) => {
    const proc = this.getProcess(pid, client)
    if (proc) {
      proc.unsetClient()
      client.emit('process.request.success')
    }
  }

  killProcess = (pid, client) => {
    try {
      permission.hasOneOf(['isAdmin', 'isOriginal'], client.request, true)
      const proc = this.getProcess(pid, client)
      if (proc) proc.stop()
    } catch (err) {
      console.error(err)
      client.emit('process.kill.error', err)
    }
  }
}

const scriptController = new ScriptController()
export default scriptController
