import React, { Component, Fragment } from 'react'
import { Grid, Paper } from '@material-ui/core'
import BotConfigEditor from './BotConfigEditor'
import BotConfigSelect from './BotConfigSelect'
import BotConfigList from './BotConfigList'
import axios from 'axios'
import Api from '../Api'
import './BotConfigs.scss'

export default class BotConfigs extends Component {
  state = {
    configList: [],
    configListLoaded: false,
    currentConfig: null,
    selectedConfig: null
  }

  componentDidMount = () => {
    this.getAllConfigs()
  }

  getAllConfigs = () => {
    axios.get(Api.getApiUrl('getAllConfigs'))
      .then((res) => {
        this.setState({ configList: res.data.data, configListLoaded: true })
      })
      .catch(Api.axiosErrorHandler)
  }

  getConfig = (name) => {
    axios.get(Api.getApiUrl('getConfig'), { params: { name } })
      .then((res) => {
        if (typeof res.data.data === 'undefined' || !res.data.success) throw new Error('Wrong answer received!')
        this.setState({ currentConfig: { ...res.data.data, saveState: 'Saved' } })
      })
      .catch((err) => {
        if (err.response.status === 410) {
          this.setState({ currentConfig: null })
          this.getAllConfigs()
        } else Api.axiosErrorHandler(err)
      })
  }

  updateConfigList = (exception) => {
    let { configList } = this.state
    configList = configList.filter(({ fromServer, name }) => name === exception || fromServer)
    return configList
  }

  onListItemSelect = (name, newConfig) => () => {
    if (newConfig) {
      const { configList } = this.state
      configList.unshift({ name, fromServer: false })
      this.setState({ configList, currentConfig: { name, saveState: 'Save' } })
    } else this.getConfig(name)
  }

  onSelectionChanged = (selectedConfig) => (isRemoving) => {
    let configList = this.updateConfigList(selectedConfig)
    let currentConfig = this.state.currentConfig

    if (isRemoving) {
      selectedConfig = ''
      currentConfig = null
    }

    this.setState({ selectedConfig, configList, currentConfig })
  }

  render () {
    const { configList, configListLoaded, currentConfig, selectedConfig } = this.state
    return (
      <Fragment>
        <Grid
          className='grid-config'
          item
          xs={12}
          sm={5}
          md={3}
          xl={2}
        >
          <Paper className='paper paper-config paper-config-list' >
            <BotConfigList
              configList={configList}
              configListLoaded={configListLoaded}
              selectedConfig={selectedConfig}
              onListItemSelect={this.onListItemSelect}
            />
          </Paper>
        </Grid>
        <Grid
          className='grid-config'
          item
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <Paper className='paper paper-config paper-config-editor' >
            {(currentConfig && typeof currentConfig === 'object') ? <BotConfigEditor
              config={currentConfig}
              onSelectionChanged={this.onSelectionChanged(currentConfig.name)}
              triggerUpdate={this.getAllConfigs}
            /> : <BotConfigSelect />}
          </Paper>
        </Grid>
      </Fragment>
    )
  }
}
