import { NodeVM } from 'vm2'
import configChecker from './configChecker'
import path from 'path'
import fs from 'fs'
import { transformSync } from '@babel/core'

const { scriptsDirectory } = configChecker(false)

export default class CustomVm {
  constructor (customOptions) {
    this.vm = new NodeVM({
      console: 'inherit',
      sandbox: { exports: {} },
      require: {
        external: { transitive: true },
        context: 'sandbox',
        root: scriptsDirectory,
        resolve: (moduleName, parentDirname) => {
          console.log({ moduleName, parentDirname })
          return path.join(scriptsDirectory, './node_modules/', moduleName)
        }
      },
      ...customOptions
    })
  }

  getVm = () => this.vm

  transformFileSync = (filePath) => {
    const fileData = fs.readFileSync(filePath)
    const transformedData = transformSync(fileData, { filename: 'executeScripts.js' })

    return transformedData.code
  }
}
