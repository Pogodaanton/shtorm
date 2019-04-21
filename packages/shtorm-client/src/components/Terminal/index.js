import React, { Component, Fragment, createRef } from 'react'
import { Paper, Typography, Button } from '@material-ui/core'
import { TerminalContext } from '../../contexts/TerminalContext'
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
    context: PropTypes.object.isRequired
  }

  state = {
    isOpened: false,
    terminalLines: [],
    isDraggingHeader: false
  }

  headerRef = createRef()

  componentDidUpdate = (prevProps, prevState) => {
  }

  componentDidMount = () => {
    this.props.context.socket.on('connect', (a) => this.addLine({ msg: `Connected to socket.` }))
    this.props.context.socket.on('log_message', this.addLine)

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
    })
  }

  toggleTerminal = () => {
    if (this.props.context.terminalHeight > minTerminalHeight) {
      this.props.context.setDesiredTerminalHeight()
      this.props.context.setTerminalHeight(minTerminalHeight)
    } else this.props.context.setTerminalHeight(this.props.context.desiredTerminalHeight)
  }

  checkElementIsHandlebar = ({ target }) => {
    if (target.tagName === 'HEADER') return true
    return false
  }

  onHandleMouseDown = (e) => {
    if (this.checkElementIsHandlebar(e)) {
      document.addEventListener('mousemove', this.onHandleMouseMove)
      this.mouseDownCapture = { y: e.clientY, terminalHeight: this.props.context.terminalHeight }
    }
  }

  mouseDownCapture = { y: 0 }

  onHandleMouseMove = (e) => {
    const { y, terminalHeight } = this.mouseDownCapture
    const { clientY } = e

    const differenceY = y - clientY
    const boundaryTop = window.innerHeight - (document.getElementById('page-header').clientHeight + this.headerRef.current.clientHeight + 15)
    const newTerminalSize = Math.max(Math.min(terminalHeight + differenceY, boundaryTop), minTerminalHeight)
    this.props.context.setTerminalHeight(newTerminalSize)

    this.setState({
      isDraggingHeader: true
    })
  }

  onHandleMouseUp = (e) => {
    if (this.state.isDraggingHeader) {
      const { terminalHeight, setDesiredTerminalHeight } = this.props.context
      if (terminalHeight > minTerminalHeight + 10) setDesiredTerminalHeight(terminalHeight)

      this.setState({
        isDraggingHeader: false
      })
    }
    document.removeEventListener('mousemove', this.onHandleMouseMove)
  }

  render () {
    const { terminalLines } = this.state
    const isOpened = (this.props.context.terminalHeight <= minTerminalHeight)
    const gridContainerStyle = {
      flexBasis: this.props.context.terminalHeight
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

export default function ContextCombiner (props) {
  return (
    <TerminalContext.Consumer>
      {(tcontext) => (
        <SocketContext.Consumer>
          {(scontext) => <Terminal
            {...props}
            context={{ ...tcontext, ...scontext }}
          />}
        </SocketContext.Consumer>
      )}
    </TerminalContext.Consumer>
  )
}
