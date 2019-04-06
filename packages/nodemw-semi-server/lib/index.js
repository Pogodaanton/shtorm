import { Server } from 'http'
import socketIo from 'socket.io'
import interceptStdout from 'intercept-stdout'

const io = socketIo(Server())
const port = process.argv[2]

io.listen(port)
io.on('connection', (client) => {
  client.on('disconnect', () => {})
  client.on('disconnect', () => {})
})

interceptStdout((msg) => {
  io.emit('log_message', { type: 'DEBUG', timestamp: new Date().getTime(), msg: msg })
  return msg
}, (errMsg) => {
  io.emit('log_message', { type: 'ERROR', timestamp: new Date().getTime(), msg: errMsg })
  return errMsg
})
