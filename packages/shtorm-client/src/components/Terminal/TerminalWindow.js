import React, { Component, Fragment, createRef } from 'react'
import PropTypes from 'prop-types'
import ls from '../LocalStorageHelper'
import DefaultGridContainer from '../DefaultGridContainer'
import DefaultGridItem from '../DefaultGridItem'
import TerminalView from '../TerminalView'
import { Paper, Button, Typography } from '@material-ui/core'
import { LineWeight, ClearAll, ExpandMore, ExpandLess } from '@material-ui/icons'
import './Terminal.scss'

const minTerminalHeight = 53
export default class TerminalWindow extends Component {
  static propTypes = {
    onEmptyListClick: PropTypes.func.isRequired
  }

  mouseDownCapture = { y: 0 }
  headerRef = createRef()
  lastTerminalHeight = 300
  state = {
    terminalHeight: 300
  }

  componentDidMount = () => {
    document.addEventListener('mousedown', this.onHandleMouseDown)
    document.addEventListener('mouseup', this.onHandleMouseUp)
    this.getSavedTerminalHeight()
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.onHandleMouseDown)
    document.removeEventListener('mouseup', this.onHandleMouseUp)
  }

  setSavedTerminalHeight = () => ls.set('terminalHeight', this.state.terminalHeight)
  getSavedTerminalHeight = () => {
    const terminalHeight = Number.parseInt(ls.get('terminalHeight'))
    if (terminalHeight > -1) this.setState({ terminalHeight })
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
      this.setSavedTerminalHeight()
    }
    document.removeEventListener('mousemove', this.onHandleMouseMove)
  }

  render () {
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
              <LineWeight />
              <Typography variant='h6'>Terminal</Typography>
              <div className='spacing' />
              <Button onClick={this.toggleTerminal}>
                {!isOpened ? (
                  <Fragment>
                    <ExpandMore />
                  Close
                  </Fragment>
                ) : (
                  <Fragment>
                    <ExpandLess />
                  Open
                  </Fragment>
                )
                }
              </Button>
              <Button
                color='primary'
                onClick={this.props.onEmptyListClick}
                disabled={isOpened}
              >
                <ClearAll />
                Empty
              </Button>
            </header>
            <TerminalView {...this.props} />
          </Paper>
        </DefaultGridItem>
      </DefaultGridContainer>
    )
  }
}
