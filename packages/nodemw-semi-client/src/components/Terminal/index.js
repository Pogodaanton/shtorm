import React, { Component } from 'react'
import { Paper, Grid } from '@material-ui/core'
import TerminalWindow from '../TerminalWindow'
import io from 'socket.io-client'
import config from '../../config.json'
import './Terminal.scss'

export default class index extends Component {
  state = {
    terminalLines: []
  }

  socket = io(config.socketAdress)

  componentWillMount = () => {
    this.socket.on('connect', () => this.addLine(`Connected to socket. (${config.socketAdress})`))
    this.socket.on('log_message', ({ type, timestamp, msg }) => this.addLine(`[${type}] ${timestamp} - ${msg}`, msg))
  }

  addLine = (msg, type = 'info') => {
    const { terminalLines } = this.state
    terminalLines.push({ msg, type })
    this.setState({ terminalLines })
  }

  render () {
    const { terminalLines } = this.state
    return (
      <Grid
        item
        xs={12}
        style={{ height: '100%' }}
      >
        <Paper className='paper paper-terminal'>
          <TerminalWindow rows={terminalLines} />
        </Paper>
      </Grid>
    )
  }
}
