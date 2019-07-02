import { exec } from 'pkg'
import path from 'path'
import rmdir from 'rimraf'
import configCheck from './lib/configChecker'

const codePath = path.join(__dirname, './build/index.js')
const log = (msg) => console.log('[BUILD] ' + msg)
configCheck(true)

log('Packaging code...')
exec([ codePath, '--out-path', 'dist', '--config', 'package.json' ])
  .then(() => {
    log('Packaging successful!')
    log('Cleaning up...')
    rmdir(path.dirname(codePath), (err) => {
      if (err) {
        log('An unexpected error happened while cleaning up.')
        console.log(err)
      }
      log('Finished! Executables can be found in /projects/shtorm-server/dist')
    })
  })
