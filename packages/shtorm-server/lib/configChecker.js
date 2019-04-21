import fs from 'fs'
import path from 'path'

function stopWithError (err) {
  console.error(err)
  process.exit(9)
}

export default () => {
  const configPath = path.join(__dirname, './config.json')
  if (!fs.existsSync(configPath)) stopWithError('You need to create a config.json in "packages/shtorm-server/lib" first! There is an example file called config.example.json in that directory which you can modify and save as config.json.')

  const configFile = fs.readFileSync(configPath)
  const config = JSON.parse(configFile)

  if (typeof config.port !== 'number') stopWithError('Key "Port" in "lib/config.json" needs to be typeof number!')
  if (typeof config.clientUrl !== 'string' || !config.clientUrl) stopWithError('Key "clientUrlin "lib/config.json" needs to be typeof string and must not be empty!')

  return config
}
