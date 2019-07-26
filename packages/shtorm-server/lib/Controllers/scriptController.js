import projectController from './projectController'
import userController, { permission } from './userController'
import configChecker from '../configChecker'
import shortid from 'shortid'
import cp from 'child_process'
import path from 'path'

/**
 * Parses Buffers to a string or to a valid JSON-Object if possible
 * @param {Buffer} data Buffer encoded in utf8 (default for console buffers)
 * @returns {object|string} Formatted output
 */
/*
function parseConsoleLog (data = new Buffer('N/A')) {
  const msg = data.toString('utf8')
}
*/

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
    this.childProcess.stdout.on('data', this.handleConsoleBuffer('DEBUG'))
    this.childProcess.stderr.on('data', this.handleConsoleBuffer('ERROR'))

    this.setClient(client)
    this.childProcess.send({ type: 'options', data: { config, scriptOptions } })
  }

  messageHandler = ({ type, data }) => {
    if (typeof type !== 'string') return
    switch (type) {
      case 'progress':
        this.clientObj = { ...this.clientObj, ...data }
        this.emitProgress()
        break
      case 'consoleObject':
        if (
          typeof data === 'object' &&
          typeof data.prefix === 'string' &&
          typeof data.obj === 'object'
        ) {
          this.emitConsole(data.prefix)(data.obj)
        }
        break

      default:
        break
    }
  }

  emitProgress = () => this.clientObj !== null && this.client.emit('script.progress', this.clientObj)
  dialogHandler = (isRejected) => (data) => {
    if (this.childProcess.connected) {
      try {
        this.childProcess.send({ type: 'dialog', data: { isRejected, data } })
      } catch (err) {
        this.emitConsole('ERROR')('==> An error happened while trying to communicate with the bot process!')
        this.emitConsole('ERROR')(err.toString())
        this.emitConsole('ERROR')('-----')
      }
    } else {
      this.emitConsole('ERROR')('==> Unable to communicate with bot process, you might have lost connection to it.')
    }
  }

  /**
   * Processes console buffer and splits it at each newline
   */
  handleConsoleBuffer = (prefix) => (data) => {
    const message = data.toString('utf8')
    const splitMessages = message
      .split('\n')
      .filter((msg) => msg.trim() !== '')

    splitMessages.forEach((msg) => this.emitConsole(prefix)(msg))
  }

  emitConsole = (prefix = 'DEBUG') => (msg) => {
    this.client.emit('log_message', {
      prefix,
      key: shortid.generate(),
      timestamp: new Date().getTime(),
      msg
    })
  }

  stop = () => this.childProcess.kill()
  exitHandler = () => {
    this.unsetClient()
    this.childProcess.kill()
    this.emitConsole('DEBUG')('-------------------------------')
    console.log(`==> Process ${this.projectId} killed`)
    this.emitConsole('DEBUG')('==> Logging halted')
    this.emitConsole('DEBUG')('-------------------------------')
    scriptController.handleStop(this, this.client)
  }

  unsetClient = () => {
    this.client.removeAllListeners('script.dialog.resolve')
    this.client.removeAllListeners('script.dialog.reject')
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

  startProcess = ({ id, scriptOptions, saveCustomOptions }, client) => {
    try {
      userController.setCustomProjectScriptOptions(id, client.request.user.id, scriptOptions, !saveCustomOptions)
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
