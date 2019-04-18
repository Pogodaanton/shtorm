import React, { Component } from 'react'
import PropTypes from 'prop-types'
import io from 'socket.io-client'
import config from '../../config.json'

export const SocketContext = React.createContext()

export default class SocketContextProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  socket = io(config.prefix + config.socketAdress, { path: config.socketPath })

  provideValue = {
    socket: this.socket
  }

  render () {
    return <SocketContext.Provider value={this.provideValue}>{this.props.children}</SocketContext.Provider>
  }
}
