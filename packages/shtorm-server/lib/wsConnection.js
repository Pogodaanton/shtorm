import scriptController from './Controllers/scriptController'
export default (client, io) => {
  client.on('disconnect', () => {})
  client.on('process.start', (data) => scriptController.startProcess(data, client))
  client.on('process.kill', (pid) => scriptController.killProcess(pid, client))
  client.on('processes.request', () => scriptController.getProcesses(client))
  client.on('process.request', (pid) => scriptController.setClientToProcess(pid, client))
  client.on('lifeline.ping', () => client.emit('log_lifeline', 'Terminal connection established!'))
}
