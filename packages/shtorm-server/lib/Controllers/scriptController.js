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
  processes = {}

  startProcess = ({ id, scriptOptions }, client) => {
    try {
      const { project, config } = projectController.getProject(id)
      if (project && config) {
        const pid = shortid.generate()

        this.processes[pid] = new Script(client, config, project.script, scriptOptions)
        client.emit('process.start.success', pid)
      } else {
        throw new Error('No project found with id ' + id)
      }
    } catch (err) {
      console.error(err)
      client.emit('process.start.error', err)
    }
  }

  killProcess = (pid, client) => {
    const proc = this.processes[pid]
    if (proc) proc.stop()
    else client.emit('process.kill.error', `Process ${pid} does not exist!`)
  }

  handleStop = (proc, client) => {
    const index = Object.values(this.processes).findIndex((t) => t === proc)
    const pid = Object.keys(this.processes)[index]
    delete this.processes[pid]
    client.emit('process.killed', true)
    this.getProcesses(client)
  }

  getProcesses = (client) => {
    const processes = Object.keys(this.processes).map((pid) => {
      const scriptExecutionData = this.processes[pid].getScriptExecutionData()
      return { pid, ...scriptExecutionData }
    })
    client.emit('processes.update', processes)
  }

  setClientToProcess = (pid, client) => {
    const proc = this.processes[pid]
    if (!proc) {
      client.emit('process.request.error', `Process ${pid} does not exist!`)
      return
    }
    proc.setClient(client)
    client.emit('process.request.success')
  }
}

const scriptController = new ScriptController()
export default scriptController
