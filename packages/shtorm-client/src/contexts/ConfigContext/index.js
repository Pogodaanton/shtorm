import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import configPath from '../../config.json'

export const ConfigContext = React.createContext()

export default class ConfigContextProvider extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  componentDidMount = () => {
    axios.get(configPath)
      .then(({ data: config }) => {
        const path = config.clientPath
        if (!path) console.error('Key clientPath was not found in config.json. This might result to the page not being able to load properly.')

        this.setState({
          loading: false,
          config
        })
      })
      .catch((err) => console.error(err))
  }

  state = {
    loading: true,
    config: {}
  }

  render () {
    return (
      <ConfigContext.Provider value={this.state.config}>
        {!this.state.loading ? this.props.children : null}
      </ConfigContext.Provider>
    )
  }
}
