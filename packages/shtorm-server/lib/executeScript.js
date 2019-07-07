/* global process */
import path from 'path'
import { transformFile } from '@babel/core'
import VM from './customVm'
import NodeMw from 'nodemw'
import Promise from 'bluebird'

var compiledCode = ''
var options = {}
var bot = null
var vm = null
var clientObj = {
  finished: false,
  progress: 0,
  progressText: '',
  dialog: {}
}

var scriptDialogResolveFunction = null
var scriptDialogRejectFunction = null

function errorExit (...reasons) {
  console.log('==> An unexpected error happened!')
  console.log(reasons)
  console.log('==> Terminating script...')
  process.exit()
}

function prepareVM () {
  const { config, scriptOptions } = options
  bot = new NodeMw({
    ...config,
    debug: true
  })
  Promise.promisifyAll(bot)

  vm = new VM({
    sandbox: {
      exports: {},
      clientOptions: scriptOptions,
      updateClient,
      bot,
      console
    }
  })

  if (typeof vm.getVm().run(compiledCode).default !== 'function') {
    errorExit('Failed to load script: exports.default needs to be a function that returns a Promise!')
    return
  }

  executeScript()
}

function executeScript () {
  try {
    vm.getVm().run(compiledCode).default()
      .then((finishedMessage) => {
        clientObj.finished = true
        updateClient({
          progress: 100,
          progressText: (typeof finishedMessage === 'string' ? finishedMessage : 'Script executed successfully.'),
          dialog: {}
        })
        process.exit()
      })
      .catch((err) => {
        errorExit('Failed to successfully execute the script.', err)
      })
  } catch (err) {
    errorExit('Failed to execute the script.', err)
  }
}

function updateClient (updateObj) {
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
      emitProgress()
    })
  }
  emitProgress()
}

function emitProgress () {
  const { finished, progress, progressText, dialog } = clientObj
  process.send({ type: 'progress', data: { finished, progress, progressText, dialog } })
}

/**
 * Beginning: code execution
 */

const scriptsFolder = path.join(__dirname, '../scripts')
const args = process.argv.slice(2)
if (args.length < 1) errorExit('Syntax: babel-node executeScript.js [scriptName]')

emitProgress()

transformFile(path.join(scriptsFolder, args[0]), (err, data) => {
  if (err) {
    errorExit('Failed to load and transpile script', err)
    return
  }

  compiledCode = data.code
  if (Object.keys(options).length > 0) prepareVM()
})

process.on('message', ({ type, data }) => {
  if (typeof type !== 'string') return
  switch (type) {
    case 'options':
      if (
        typeof data === 'object' &&
        typeof data.config !== 'undefined' &&
        typeof data.scriptOptions !== 'undefined'
      ) {
        options = data
        if (compiledCode.length > 0) prepareVM()
      }
      break

    case 'dialog':
      const resolve = scriptDialogResolveFunction
      const reject = scriptDialogRejectFunction
      const { isRejected, newText } = data
      if (typeof resolve === 'function' && typeof reject === 'function') {
        if (isRejected) reject(newText)
        else resolve(newText)

        clientObj.dialog = {}
        scriptDialogResolveFunction = null
        scriptDialogRejectFunction = null
      }
      break

    default:
      break
  }
})
