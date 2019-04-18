import fs from 'fs'
import path from 'path'
import configController from './configController'
import { VM } from 'vm2'
import { transformFileSync } from '@babel/core'

const scriptsFolder = path.join(__dirname, '../../scripts')
class ScriptConfigController {
  constructor () {
    if (!fs.existsSync(scriptsFolder)) fs.mkdirSync(scriptsFolder)
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
      .map(e => e[uniqueId])
      .map((e, i, final) => e !== 'script' && e !== 'config' && e !== 'name' && final.indexOf(e) === i && i) // store the keys of the unique objects
      .filter(e => arr[e]) // eliminate the dead keys & store unique objects
      .map(e => arr[e])

    return unique
  }

  getScriptOptions = (scriptName) => {
    const vm = new VM({
      sandbox: { exports: {} },
      require: {
        external: false,
        builtin: ['lowdb'],
        root: './'
      }
    })
    /* const scriptOptions = [
      { type: 'text', name: 'Summary', value: 'Infobox --> Infobox_Waffen | Fragen: [[User:Pogodaanton|Pogodaanton]]' },
      { type: 'number', name: 'From page in category', value: 0 },
      { type: 'number', name: 'Amount of pages', value: 10 }
    ] */
    const { code } = transformFileSync(path.join(scriptsFolder, `./${scriptName}`))
    const scriptOptions = vm.run(code).scriptOptions
    if (typeof scriptOptions !== 'object') return []
    return this.makeUnique(scriptOptions, 'name')
  }

  getAllScripts = () => {
    return fs.readdirSync(scriptsFolder).map((name) => name.slice(-3) === '.js' && name)
  }
}

const scriptController = new ScriptConfigController()
export default scriptController
