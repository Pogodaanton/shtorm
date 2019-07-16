import fs from 'fs'
import path from 'path'
import configController from './configController'
import VM from '../customVm'
import configChecker from '../configChecker'

class ScriptConfigController {
  constructor (scriptsDirectory) {
    this.scriptsDirectory = scriptsDirectory
  }

  requestScriptOptions = (req, res) => {
    const data = this.getScriptOptions(req.query.script)
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'Script options successfully requested.',
        data
      })
    } else {
      return res.status(410).send({
        success: false,
        message: 'The requested script was not found!'
      })
    }
  }

  requestAllScripts = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Scripts and configs successfully requested.',
      data: {
        scripts: this.getAllScripts(),
        configs: configController.getAllConfigs()
      }
    })
  }

  /**
   * Looks for duplicates in an array of objects based on a unique identifier
   * Code originally from: https://reactgo.com/removeduplicateobjects/ 🙇🏻‍
   * @param {array} arr - Array which will be checked
   * @param {string} uniqueId - Name of the key that should be the reference for duplicates
   */
  makeUnique = (arr, uniqueId) => {
    const unique = arr
      .map(item => item[uniqueId])
      .map((uniqueItem, i, final) => uniqueItem !== 'script' && uniqueItem !== 'config' && uniqueItem !== 'name' && final.indexOf(uniqueItem) === i && i) // store the keys of the unique objects
      .filter(e => arr[e]) // eliminate the dead keys & store unique objects
      .map(e => arr[e])

    return unique
  }

  getScriptOptions = (scriptName) => {
    const scriptPath = path.join(this.scriptsDirectory, `./${scriptName}`)
    const vm = new VM()

    const code = vm.transformFileSync(scriptName)
    const { scriptOptions } = vm.getVM().run(code, scriptPath)

    if (typeof scriptOptions !== 'object') return []
    return this.makeUnique(scriptOptions, 'name')
  }

  getAllScripts = () => {
    return fs.readdirSync(this.scriptsDirectory).filter((name) => name.slice(-3) === '.js')
  }
}

const { scriptsDirectory } = configChecker(false)
const scriptController = new ScriptConfigController(scriptsDirectory)

export default scriptController
