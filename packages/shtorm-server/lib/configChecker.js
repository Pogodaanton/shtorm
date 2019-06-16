import fs from 'fs'
import path from 'path'

function stopWithError (err) {
  console.error(err)
  process.exit(9)
}

export default (isCompiling = false) => {
  const configPath = path.join(__dirname, './config.json')
  if (!fs.existsSync(configPath)) stopWithError('You need to create a config.json in "packages/shtorm-server/lib" first! There is an example file called config.example.json in that directory which you can modify and save as config.json.')

  const configFile = fs.readFileSync(configPath)
  const config = JSON.parse(configFile)
  const directories = [config.scriptsDirectory, config.databaseDirectory]
  const args = process.argv.slice(2)

  if (typeof config.port !== 'number') stopWithError('Key "Port" in "lib/config.json" needs to be typeof number!')
  if (typeof config.clientUrl !== 'string' || !config.clientUrl) stopWithError('Key "clientUrl" in "lib/config.json" needs to be typeof string and must not be empty!')
  if (typeof config.sessionSecret !== 'string' || !config.sessionSecret) stopWithError('Key "sessionSecret" in "lib/config.json" needs to be typeof string and must not be empty!')

  if (!isCompiling) {
    directories.forEach((directoryPath, i) => {
      if (args && args.length > 0) {
        if (!args[i]) stopWithError('Syntax: shtorm-server [scriptsDirPath] [databaseDirPath]')
        directoryPath = args[i]
      } else if (typeof directoryPath !== 'string' || !config.scriptsDirectory) {
        stopWithError('Key "scriptsDirectory" or "databaseDirectory" in "lib/config.json" is not typeof string or is empty!')
      }

      // Check whether path is absolute or relative; true === absolute
      // Taken from https://stackoverflow.com/a/24225816
      let newDirectoryPath = path.normalize(directoryPath)
      if ((!args && args.length === 0) && path.resolve(directoryPath) !== path.normalize(directoryPath).replace(RegExp(path.sep + '$'), '')) {
        newDirectoryPath = path.resolve(__dirname, directoryPath)
      }

      if (!fs.existsSync(newDirectoryPath)) fs.mkdirSync(newDirectoryPath)
    })
  }

  return config
}
