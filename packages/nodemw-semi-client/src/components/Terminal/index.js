import React, { Component } from 'react'
import { Paper, Grid, Typography, Button } from '@material-ui/core'
import LineWeightIcon from '@material-ui/icons/LineWeight'
import ClearAllIcon from '@material-ui/icons/ClearAll'
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
    this.socket.on('connect', () => this.addLine({ msg: `Connected to socket. (${config.socketAdress})` }))
    this.socket.on('log_message', this.addLine)
  }

  getCurrentTimestamp = () => {
    return new Date().getTime()
  }

  addLine = ({ msg = 'N/A', type = 'CLIENT', timestamp = this.getCurrentTimestamp() }) => {
    const { terminalLines } = this.state
    terminalLines.push({ msg, type, timestamp })
    this.setState({ terminalLines })
  }

  emptyList = () => {
    this.setState({
      terminalLines: [{
        msg: 'Terminal log has been emptied.',
        type: 'CLIENT',
        timestamp: this.getCurrentTimestamp()
      }]
    })
  }

  render () {
    const { terminalLines } = this.state
    return (
      <Grid
        item
        xs={12}
        style={{ height: '100%' }}
      >
        <Paper className='paper paper-window paper-terminal'>
          <header>
            <LineWeightIcon />
            <Typography variant='h6'>Terminal</Typography>
            <div className='spacing' />
            <Button
              color='primary'
              onClick={this.emptyList}
            >
              Empty
              <ClearAllIcon />
            </Button>
          </header>
          <TerminalWindow rows={terminalLines} />
        </Paper>
      </Grid>
    )
  }
}
