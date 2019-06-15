import React, { Component, Fragment, createRef } from 'react'
import { Paper, Typography, Button } from '@material-ui/core'
import LineWeightIcon from '@material-ui/icons/LineWeight'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import PropTypes from 'prop-types'
import DefaultGridItem from '../DefaultGridItem/index'
import TerminalWindow from '../TerminalWindow'
import DefaultGridContainer from '../DefaultGridContainer/index'
import { SocketContext } from '../../contexts/SocketContext'
import './Terminal.scss'

let minTerminalHeight = 53
class Terminal extends Component {
  static propTypes = {
    socket: PropTypes.object.isRequired
  }

  headerRef = createRef()
  lastTerminalHeight: 300
  state = {
    isOpened: false,
    terminalLines: [],
    isDraggingHeader: false,
    terminalHeight: 300
  }

  forceUpdateTerminalWindow = () => null

  componentDidMount = () => {
    this.props.socket.on('connect', (a) => this.addLine({ msg: `Connected to socket.` }))
    this.props.socket.on('disconnect', (a) => this.addLine({ msg: `Disconnected from socket.` }))
    this.props.socket.on('log_lifeline', (msg) => this.addLine({ msg }))
    this.props.socket.on('log_message', this.addLine)
    this.props.socket.emit('lifeline.ping')

    document.addEventListener('mousedown', this.onHandleMouseDown)
    document.addEventListener('mouseup', this.onHandleMouseUp)
  }

  componentWillUnmount = () => {
    this.addLine({ msg: 'Terminal connection closed!' })
    document.removeEventListener('mousedown', this.onHandleMouseDown)
    document.removeEventListener('mouseup', this.onHandleMouseUp)
  }

  getCurrentTimestamp = () => new Date().getTime()

  addLine = ({ msg = 'N/A', type = 'CLIENT', timestamp = this.getCurrentTimestamp(), key = timestamp }) => {
    const { terminalLines } = this.state
    terminalLines.push({ msg, type, timestamp, key })
    this.setState({ terminalLines })
  }

  emptyList = () => {
    const timestamp = this.getCurrentTimestamp()
    this.setState({
      terminalLines: [{
        msg: 'Terminal log has been emptied.',
        type: 'CLIENT',
        key: timestamp,
        timestamp
      }]
    }, () => this.forceUpdateTerminalWindow())
  }

  toggleTerminal = () => {
    let terminalHeight = this.desiredTerminalHeight
    if (this.state.terminalHeight > minTerminalHeight) {
      this.desiredTerminalHeight = this.state.terminalHeight
      terminalHeight = minTerminalHeight
    }

    this.setState({ terminalHeight })
  }

  checkElementIsHandlebar = ({ target }) => {
    if (target.tagName === 'HEADER') return true
    return false
  }

  onHandleMouseDown = (e) => {
    if (this.checkElementIsHandlebar(e)) {
      document.addEventListener('mousemove', this.onHandleMouseMove)
      this.mouseDownCapture = { y: e.clientY, terminalHeight: this.state.terminalHeight }
    }
  }

  mouseDownCapture = { y: 0 }

  onHandleMouseMove = (e) => {
    const { y, terminalHeight } = this.mouseDownCapture
    const { clientY } = e

    const differenceY = y - clientY
    const boundaryTop = window.innerHeight - (document.getElementById('page-header').clientHeight + this.headerRef.current.clientHeight + 15)
    const newTerminalSize = Math.max(Math.min(terminalHeight + differenceY, boundaryTop), minTerminalHeight)

    this.setState({
      isDraggingHeader: true,
      terminalHeight: newTerminalSize
    })
  }

  onHandleMouseUp = (e) => {
    if (this.state.isDraggingHeader) {
      const { terminalHeight } = this.state
      if (terminalHeight > minTerminalHeight + 10) {
        this.desiredTerminalHeight = terminalHeight
      }

      this.setState({ isDraggingHeader: false })
    }
    document.removeEventListener('mousemove', this.onHandleMouseMove)
  }

  onForceUpdateRef = (r = () => null) => {
    this.forceUpdateTerminalWindow = r
  }

  render () {
    const { terminalLines } = this.state
    const isOpened = (this.state.terminalHeight <= minTerminalHeight)
    const gridContainerStyle = {
      flexBasis: this.state.terminalHeight
    }

    return (
      <DefaultGridContainer
        name='terminal'
        style={gridContainerStyle}
      >
        <DefaultGridItem name='terminal'>
          <Paper className='paper paper-window paper-terminal'>
            <header
              id='terminalHeader'
              ref={this.headerRef}
            >
              <LineWeightIcon />
              <Typography variant='h6'>Terminal</Typography>
              <div className='spacing' />
              <Button
                onClick={this.toggleTerminal}
              >
                {!isOpened ? <Fragment>
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
                disabled={isOpened}
              >
                <ClearAllIcon />
                Empty
              </Button>
            </header>
            <TerminalWindow
              rows={terminalLines}
              disableTransition
              forceUpdateRef={this.onForceUpdateRef}
            />
          </Paper>
        </DefaultGridItem>
      </DefaultGridContainer>
    )
  }
}

export default function ContextAdder (props) {
  return (
    <SocketContext.Consumer>
      {(scontext) => (
        <Terminal
          {...props}
          socket={scontext.socket}
        />
      )}
    </SocketContext.Consumer>
  )
}
