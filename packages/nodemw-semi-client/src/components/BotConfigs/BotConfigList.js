import React, { Component } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@material-ui/core'
import { Add, Dns } from '@material-ui/icons'
import axios from 'axios'
import Api from '../Api'
import PropTypes from 'prop-types'

export default class BotConfigList extends Component {
  // static contextType = MultiContext
  static propTypes = {
    configList: PropTypes.array,
    selectedConfig: PropTypes.string,
    configListLoaded: PropTypes.bool,
    onListItemSelect: PropTypes.func.isRequired
  }

  state = {
    configList: [],
    selectedConfig: null,
    configListLoaded: false
  }

  onAddClick = (e) => {
    let { configList } = this.state

    // Untitled Config should start counting up if there is already one called Untitled Config
    let i = 1
    while (configList.find(({ name: configName }) => configName === 'Untitled Config' + (i > 1 ? ' ' + i : ''))) i++

    const name = 'Untitled Config' + (i > 1 ? ' ' + i : '')
    this.props.onListItemSelect(name, true)()
  }

  static getDerivedStateFromProps = (props, oldState) => {
    /*
    if (props.selectedConfig === oldState.selectedConfig || !oldState.configListLoaded) return null

    const { configList } = oldState
    const { selectedConfig } = props
    if (configList.findIndex((item) => item === selectedConfig) < 0) {
      configList.unshift(selectedConfig)
    }

    return { selectedConfig, configList }
    */
    return { configList: props.configList, selectedConfig: props.selectedConfig, configListLoaded: props.configListLoaded }
  }

  render () {
    const { configList, configListLoaded, selectedConfig } = this.state
    const { onListItemSelect } = this.props
    return (
      <List>
        <ListItem
          button
          key={'add'}
          onClick={this.onAddClick}
          disabled={!configListLoaded}
        >
          <ListItemIcon><Add /></ListItemIcon>
          <ListItemText primary={'Add Config'} />
        </ListItem>
        <Divider />
        {!configListLoaded && (
          <ListItem key={'loading'} >
            <ListItemIcon><CircularProgress size={22} /></ListItemIcon>
            <ListItemText primary={'Loading Configs'} />
          </ListItem>
        )}
        {configList.map(({ name }, index) => (
          <ListItem
            button
            name={name}
            key={name}
            selected={name === selectedConfig}
            onClick={onListItemSelect(name)}
          >
            <ListItemIcon><Dns /></ListItemIcon>
            <ListItemText primary={name} />
          </ListItem>
        ))}
      </List>

    )
  }
}
