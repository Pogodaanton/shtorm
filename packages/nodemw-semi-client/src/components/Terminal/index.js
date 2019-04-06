import React, { Component, Fragment, createRef } from 'react'
import { Paper, Typography, Button } from '@material-ui/core'
import LineWeightIcon from '@material-ui/icons/LineWeight'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import TerminalWindow from '../TerminalWindow'
import { MultiContext } from '../MultiContext'
import io from 'socket.io-client'
import config from '../../config.json'
import './Terminal.scss'

export default class index extends Component {
  static contextType = MultiContext

  state = {
    terminalLines: [],
    isDraggingHeader: false
  }

  socket = io(config.socketAdress)

  componentWillMount = () => {
    this.socket.on('connect', () => this.addLine({ msg: `Connected to socket. (${config.socketAdress})` }))
    this.socket.on('log_message', this.addLine)

    document.addEventListener('mousedown', this.onHandleMouseDown)
    document.addEventListener('mouseup', this.onHandleMouseUp)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.onHandleMouseDown)
    document.removeEventListener('mouseup', this.onHandleMouseUp)
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

  toggleTerminal = () => {
    if (this.context.terminalHeight > 0) {
      this.context.setDesiredTerminalHeight()
      this.context.setTerminalHeight(0)
    } else this.context.setTerminalHeight(this.context.desiredTerminalHeight)
  }

  checkElementIsHandlebar = ({ target }) => {
    if (target.tagName === 'HEADER') return true
    return false
  }

  onHandleMouseDown = (e) => {
    if (this.checkElementIsHandlebar(e)) {
      document.addEventListener('mousemove', this.onHandleMouseMove)
      this.mouseDownCapture = { y: e.clientY, terminalHeight: this.context.terminalHeight }
    }
  }

  mouseDownCapture = { y: 0 }
  header = createRef()

  onHandleMouseMove = (e) => {
    const { y, terminalHeight } = this.mouseDownCapture
    const { clientY } = e

    const differenceY = y - clientY
    const boundaryTop = window.innerHeight - (document.getElementById('page-header').clientHeight + this.header.current.clientHeight + 15)
    const newTerminalSize = Math.max(Math.min(terminalHeight + differenceY, boundaryTop), 0)
    this.context.setTerminalHeight(newTerminalSize)

    this.setState({
      isDraggingHeader: true
    })
  }

  onHandleMouseUp = (e) => {
    if (this.state.isDraggingHeader) {
      document.removeEventListener('mousemove', this.onHandleMouseMove)
      this.setState({
        isDraggingHeader: false
      })
    }
  }

  render () {
    const { terminalLines, isDraggingHeader } = this.state
    const { terminalHeight } = this.context
    return (
      <Paper className='paper paper-window paper-terminal'>
        <header ref={this.header}>
          <LineWeightIcon />
          <Typography variant='h6'>Terminal</Typography>
          <div className='spacing' />
          <Button
            onClick={this.toggleTerminal}
          >
            {terminalHeight > 0 ? <Fragment>
              <ExpandMoreIcon />
                Close
            </Fragment> : <Fragment>
              <ExpandLessIcon />
                Open
            </Fragment> }
          </Button>
          <Button
            color='primary'
            onClick={this.emptyList}
            disabled={terminalHeight <= 0}
          >
            <ClearAllIcon />
              Empty
          </Button>
        </header>
        <TerminalWindow
          rows={terminalLines}
          height={terminalHeight}
          disableTransition={isDraggingHeader}
        />
      </Paper>
    )
  }
}
