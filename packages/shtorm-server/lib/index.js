import { Server } from 'http'
import socketIo from 'socket.io'
import shortid from 'shortid'
import interceptStdout from 'intercept-stdout'
import express from 'express'
import bodyParser from 'body-parser'
import expressValidator from 'express-validator'
import passport from 'passport'
import session from 'express-session'
import path from 'path'
import NedbStore from 'nedb-session-store'
// import passportSocketIo from 'passport.socketio'
import wsConnection, { socketPassportMiddleware } from './wsConnection'
import httpConnection from './httpConnection'
import configChecker from './configChecker'

const { port, clientUrl, sessionSecret } = configChecker()
const app = express()
const httpServer = Server(app)
const io = socketIo(httpServer)
const sessionMiddleware = session({
  store: new NedbStore(session)({ filename: path.join(__dirname, '../db/sessionStore.db') }),
  key: 'shtorm.user.session',
  secret: sessionSecret,
  cookie: { secure: false },
  resave: false,
  saveUninitialized: false
})

// Hooking body-parser and httpConnection middleware to express
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(expressValidator())
  .use(sessionMiddleware)
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', clientUrl)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')
    next()
  })
  .use(httpConnection)

// Hooking passport info to socket.io; Wraps the express middleware
io.use(socketPassportMiddleware(sessionMiddleware))

// Sending connections to wsConnection
io.on('connection', (client) => wsConnection(client, io))

// Start server
httpServer.listen(port, () => console.log(`Listening on *:${port}`))

/**
 * Intercepting console log in order to send it to client
 */
interceptStdout((msg) => {
  io.emit('log_message', { type: 'DEBUG', key: shortid.generate(), timestamp: new Date().getTime(), msg: msg })
  return msg
}, (errMsg) => {
  io.emit('log_message', { type: 'ERROR', key: shortid.generate(), timestamp: new Date().getTime(), msg: errMsg })
  return errMsg
})
