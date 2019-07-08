import { NodeVM } from 'vm2'
import configChecker from './configChecker'
import path from 'path'
import fs from 'fs'
import { transformSync } from '@babel/core'

export default class CustomVm {
  constructor (customOptions, customScriptsDirectory = configChecker().scriptsDirectory) {
    this.scriptsDirectory = customScriptsDirectory
    this.vm = new NodeVM({
      console: 'inherit',
      require: {
        external: { transitive: true },
        context: 'sandbox',
        root: this.scriptsDirectory,
        resolve: (moduleName, parentDirname) => {
          console.log({ moduleName, parentDirname })
          return path.join(this.scriptsDirectory, './node_modules/', moduleName)
        }
      },
      ...customOptions
    })
  }

  getVM = () => this.vm
  getScriptPath = (fileName) => path.join(this.scriptsDirectory, fileName)

  transformFileSync = (fileName) => {
    const fileData = fs.readFileSync(this.getScriptPath(fileName))
    const transformedData = transformSync(fileData, { filename: 'executeScripts.js' })

    return transformedData.code
  }
}
