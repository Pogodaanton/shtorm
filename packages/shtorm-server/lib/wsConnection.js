import scriptController from './Controllers/scriptController'
export default (client, io) => {
  client.on('disconnect', () => {})
  client.on('task.start', (name) => scriptController.startProcess(name, client))
  client.on('task.kill', (uuid) => scriptController.killProcess(uuid, client))
  client.on('tasks.request', () => scriptController.getProcesses(client))
  client.on('task.request', (uuid) => scriptController.setClientToProcess(uuid, client))
  client.on('lifeline.ping', () => client.emit('log_lifeline', 'Terminal connection established!'))
}
