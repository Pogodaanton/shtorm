import React, { Component } from 'react'
import PropTypes from 'prop-types'

export const MultiContext = React.createContext()

export default class index extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  state = {
    terminalHeight: 300,
    desiredTerminalHeight: 300
  }

  onTerminalHeightChange = (terminalHeight) => {
    this.setState({ terminalHeight })
  }

  onDesiredTerminalHeightChange = (desiredTerminalHeight = this.state.terminalHeight) => {
    this.setState({ desiredTerminalHeight })
  }

  render () {
    return <MultiContext.Provider value={{
      setTerminalHeight: this.onTerminalHeightChange,
      setDesiredTerminalHeight: this.onDesiredTerminalHeightChange,
      ...this.state
    }}
    >{this.props.children}</MultiContext.Provider>
  }
}
