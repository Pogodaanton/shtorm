import React, { Component } from 'react'
import PropTypes from 'prop-types'
import io from 'socket.io-client'
import { ConfigContext } from '../ConfigContext'

export const SocketContext = React.createContext()

export default class SocketContextProvider extends Component {
  static contextType = ConfigContext
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  socket = io(this.context.prefix + this.context.socketAdress, {
    path: this.context.socketPath,
    autoConnect: false
  })

  provideValue = {
    socket: this.socket
  }

  render () {
    return <SocketContext.Provider value={this.provideValue}>{this.props.children}</SocketContext.Provider>
  }
}
