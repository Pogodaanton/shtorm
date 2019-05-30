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
import wsConnection from './wsConnection'
import httpConnection from './httpConnection'
import configChecker from './configChecker'

const { port, clientUrl, sessionSecret } = configChecker()
const app = express()
const httpServer = Server(app)
const io = socketIo(httpServer)

// Sending connections to wsConnection
io.on('connection', (client) => wsConnection(client, io))

// Hooking body-parser and httpConnection middleware to express
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(session({
  store: new NedbStore(session)({ filename: path.join(__dirname, '../db/sessionStore.db') }),
  secret: sessionSecret,
  cookie: {},
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', clientUrl)
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})
app.use(httpConnection)

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
