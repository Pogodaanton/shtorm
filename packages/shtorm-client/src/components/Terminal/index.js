import React, { Component } from 'react'
import { SocketContext } from '../../contexts/SocketContext'
import Loader from '../Loader'
import PropTypes from 'prop-types'

const TerminalWindow = Loader(import('./TerminalWindow'), () => null)

class TerminalSocketController extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired
  }

  state = {
    terminalLines: []
  }

  componentDidMount = () => {
    this.props.socket.on('connect', this.addConnectedLine)
    this.props.socket.on('disconnect', this.addDisconnectedLine)
    this.props.socket.on('log_lifeline', this.addLine)
    this.props.socket.on('log_message', this.addLine)
    this.props.socket.emit('lifeline.ping')
  }

  componentWillUnmount = () => {
    this.props.socket.off('connect', this.addConnectedLine)
    this.props.socket.off('disconnect', this.addDisconnectedLine)
    this.props.socket.off('log_lifeline', this.addLine)
    this.props.socket.off('log_message', this.addLine)
  }

  addConnectedLine = () => this.addLine({ msg: `Connected to socket.` })
  addDisconnectedLine = () => this.addLine({ msg: `Disconnected to socket.` })
  getCurrentTimestamp = () => new Date().getTime()

  addLine = ({ prefix = 'CLIENT', timestamp = this.getCurrentTimestamp(), key = timestamp, msg = 'N/A' }) => {
    const { terminalLines } = this.state
    terminalLines.push({ prefix, timestamp, key, msg })
    this.setState({ terminalLines })
  }

  removeAllLines = () => {
    const timestamp = this.getCurrentTimestamp()
    this.setState({
      terminalLines: [
        {
          msg: 'Terminal log has been emptied.',
          prefix: 'CLIENT',
          key: timestamp,
          timestamp
        }
      ]
    })
  }

  render () {
    return <TerminalWindow
      {...this.state}
      onEmptyListClick={this.removeAllLines}
    />
  }
}

export default function ContextAdder (props) {
  return (
    <SocketContext.Consumer>
      {({ socket }) => (
        <TerminalSocketController
          {...props}
          socket={socket}
        />
      )}
    </SocketContext.Consumer>
  )
}
