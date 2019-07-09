/* global process */
import VM from './customVm'
import NodeMW from 'nodemw'
import promise from 'bluebird'

var scriptDialogResolveFunction = null
var scriptDialogRejectFunction = null

const clientObj = {
  finished: false,
  progress: 0,
  progressText: '',
  dialog: {}
}

/*
 * Adding object detection logic to console
 * Then raw objects can be sent to the client
 */
const { log: oldConsoleLog, error: oldConsoleError } = console
const logInjector = (prefix, oldFunction) => (...args) => {
  args.forEach((arg) => {
    if (typeof arg === 'object') {
      process.send({
        type: 'consoleObject',
        data: {
          prefix,
          obj: arg
        }
      })
      return
    }

    oldFunction(arg)
  })
}

console.log = logInjector('DEBUG', oldConsoleLog)
console.error = logInjector('ERROR', oldConsoleError)

const scriptRelays = {
  updateClient: (updateObj) => {
    if (typeof updateObj !== 'object') {
      console.log('Function "updateClient" requires an "Object" as argument.')
      return new Promise((resolve) => resolve())
    }

    const { progress, progressText, dialog } = updateObj
    if (typeof progress === 'number') clientObj.progress = progress
    if (typeof progressText === 'string') clientObj.progressText = progressText
    if (typeof dialog === 'object') {
      return new Promise((resolve, reject) => {
        clientObj.dialog = dialog
        scriptDialogResolveFunction = resolve
        scriptDialogRejectFunction = reject
        scriptRelays.emitProgress()
      })
    }
    scriptRelays.emitProgress()
  },

  emitProgress: () => {
    const { finished, progress, progressText, dialog } = clientObj
    process.send({ type: 'progress', data: { finished, progress, progressText, dialog } })
  },

  onProcessMessage: ({ type, data }) => {
    if (typeof type !== 'string') return
    switch (type) {
      case 'options':
        if (
          typeof data === 'object' &&
          typeof data.config !== 'undefined' &&
          typeof data.scriptOptions !== 'undefined'
        ) {
          scriptExecutor.prepareVM(data)
        }
        break

      case 'dialog':
        const { data: res, isRejected } = data
        const resolve = scriptDialogResolveFunction
        const reject = scriptDialogRejectFunction

        if (isRejected && typeof reject === 'function') {
          reject(res)
        } else if (typeof resolve === 'function') {
          resolve(res)
        }

        clientObj.dialog = {}
        scriptDialogResolveFunction = null
        scriptDialogRejectFunction = null
        break

      default:
        break
    }
  }
}

const scriptExecutor = {
  args: process.argv.slice(2),
  vm: null,
  bot: null,
  scriptPath: null,
  transformedCode: '',

  errorExit: (...reasons) => {
    console.log('==> A fatal error happened!')
    console.log(reasons)
    console.log('==> Terminating script...')
    process.exit()
  },

  runVMdefault: () => scriptExecutor.vm.run(scriptExecutor.transformedCode, scriptExecutor.scriptPath).default,

  prepareVM: ({ config, scriptOptions: clientOptions }) => {
    const [scriptName, scriptDirectory] = scriptExecutor.args
    const { updateClient } = scriptRelays
    scriptExecutor.bot = new NodeMW({
      ...config,
      debug: true
    })
    promise.promisifyAll(scriptExecutor.bot)

    const VMController = new VM({
      sandbox: {
        clientOptions,
        updateClient,
        bot: scriptExecutor.bot,
        console
      }
    }, scriptDirectory)

    try {
      scriptExecutor.transformedCode = VMController.transformFileSync(scriptName)
    } catch (err) {
      scriptExecutor.errorExit('Failed to load and transpile the script:', err)
    }

    scriptExecutor.scriptPath = VMController.getScriptPath(scriptName)
    scriptExecutor.vm = VMController.getVM()

    if (typeof scriptExecutor.runVMdefault() !== 'function') {
      scriptExecutor.errorExit('Failed to load script: exports.default needs to be a function that returns a Promise!')
      return
    }

    scriptExecutor.executeScript()
  },

  executeScript: () => {
    try {
      scriptExecutor.runVMdefault()()
        .then((finishedMessage) => {
          clientObj.finished = true
          scriptRelays.updateClient({
            progress: 100,
            progressText: (typeof finishedMessage === 'string' ? finishedMessage : 'Script executed successfully.'),
            dialog: {}
          })
          process.exit()
        })
        .catch((err) => {
          scriptExecutor.errorExit('Failed to successfully execute the script.', err)
        })
    } catch (err) {
      scriptExecutor.errorExit('Failed to execute the script.', err)
    }
  },

  start: () => {
    if (scriptExecutor.args.length < 2) scriptExecutor.errorExit('Syntax: babel-node executeScript.js [scriptName] [scriptsDirPath]')

    scriptRelays.emitProgress()
  }
}

scriptExecutor.start()
process.on('message', scriptRelays.onProcessMessage)
