import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const TerminalContext = React.createContext()

export default class TerminalContextProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  onTerminalHeaderHeightChange = (terminalHeaderHeight) => {
    this.setState({ terminalHeaderHeight })
  }

  onTerminalHeightChange = (terminalHeight) => {
    this.setState({ terminalHeight })
  }

  onDesiredTerminalHeightChange = (desiredTerminalHeight = this.state.terminalHeight) => {
    this.setState({ desiredTerminalHeight })
  }

  state = {
    terminalHeight: 300,
    desiredTerminalHeight: 300,
    terminalHeaderHeight: 0,
    setTerminalHeight: this.onTerminalHeightChange,
    setDesiredTerminalHeight: this.onDesiredTerminalHeightChange,
    setTerminalHeader: this.onTerminalHeaderHeightChange
  }

  render () {
    return <TerminalContext.Provider value={this.state}>{this.props.children}</TerminalContext.Provider>
  }
}
