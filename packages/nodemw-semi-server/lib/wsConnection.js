import presetController from './Controllers/presetController'
import scriptController from './Controllers/scriptController'
export default (client) => {
  client.on('disconnect', () => {})
  client.on('start', (name) => scriptController.startScript(name, client))
  client.on('stop', (uuid) => scriptController.stopScript(uuid, client))
}
