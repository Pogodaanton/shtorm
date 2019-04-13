import React, { Component, Fragment, createRef } from 'react'
import { Paper, Typography, Button } from '@material-ui/core'
import { TerminalContext } from '../../contexts/TerminalContext'
import LineWeightIcon from '@material-ui/icons/LineWeight'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DefaultGridItem from '../DefaultGridItem/index'
import TerminalWindow from '../TerminalWindow'
import io from 'socket.io-client'
import config from '../../config.json'
import './Terminal.scss'
import DefaultGridContainer from '../DefaultGridContainer/index'

let minTerminalHeight = 53
export default class Terminal extends Component {
  static contextType = TerminalContext
  state = {
    isOpened: false,
    terminalLines: [],
    isDraggingHeader: false
  }

  headerRef = createRef()
  socket = io(config.socketAdress)

  componentDidUpdate = (prevProps, prevState) => {
  }

  componentDidMount = () => {
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
    if (this.context.terminalHeight > minTerminalHeight) {
      this.context.setDesiredTerminalHeight()
      this.context.setTerminalHeight(minTerminalHeight)
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

  onHandleMouseMove = (e) => {
    const { y, terminalHeight } = this.mouseDownCapture
    const { clientY } = e

    const differenceY = y - clientY
    const boundaryTop = window.innerHeight - (document.getElementById('page-header').clientHeight + this.headerRef.current.clientHeight + 15)
    const newTerminalSize = Math.max(Math.min(terminalHeight + differenceY, boundaryTop), 0)
    this.context.setTerminalHeight(newTerminalSize)

    this.setState({
      isDraggingHeader: true
    })
  }

  onHandleMouseUp = (e) => {
    if (this.state.isDraggingHeader) {
      const { terminalHeight, setDesiredTerminalHeight } = this.context
      if (terminalHeight > 10) setDesiredTerminalHeight(terminalHeight)
    }

    document.removeEventListener('mousemove', this.onHandleMouseMove)
    this.setState({
      isDraggingHeader: false
    })
  }

  render () {
    const { terminalLines } = this.state
    const isOpened = (this.context.terminalHeight <= minTerminalHeight)
    const gridContainerStyle = {
      flexBasis: Math.max(this.context.terminalHeight, minTerminalHeight)
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
            />
          </Paper>
        </DefaultGridItem>
      </DefaultGridContainer>
    )
  }
}
