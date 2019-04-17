import scriptController from './Controllers/scriptController'
export default (client, io) => {
  client.on('disconnect', () => {})
  client.on('task.start', (name) => scriptController.startScript(name, client))
  client.on('task.stop', (uuid) => scriptController.stopScript(uuid, client))
  client.on('tasks.request', () => scriptController.getTasks(client))
  client.on('task.request', (uuid) => scriptController.setClientToTask(uuid, client))
}
