import scriptController from './Controllers/scriptController'
import { deserializeUser } from './Controllers/userController'

// Middleware for adding req.user to socket
export const socketPassportMiddleware = (sessionMiddleware) => (socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, (err) => {
    if (!err) {
      const userId = typeof socket.request.session.passport === 'object' ? socket.request.session.passport.user : ''

      deserializeUser(userId, (errObj, userObj) => {
        if (errObj || !userObj) next(new Error(errObj.message || errObj || 'An unknown error happened!'))
        else socket.request.user = userObj
        next()
      })
    } else next(err)
  })
}

export default (client, io) => {
  client.on('disconnect', () => {})
  client.on('process.start', (data) => scriptController.startProcess(data, client))
  client.on('process.kill', (pid) => scriptController.killProcess(pid, client))
  client.on('processes.request', () => scriptController.getProcesses(client))
  client.on('process.request', (pid) => scriptController.setClientToProcess(pid, client))
  client.on('lifeline.ping', () => client.emit('log_lifeline', { msg: 'Terminal connection established!' }))
}
