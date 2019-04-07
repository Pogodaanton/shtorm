import React, { Component, Fragment } from 'react'
import { Grid, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Snackbar } from '@material-ui/core'
import PropTypes from 'prop-types'
import { Add, Dns } from '@material-ui/icons'
import './BotConfigs.scss'
import { MultiContext } from '../MultiContext'
import BotConfigEditor from './BotConfigEditor'
import BotConfigSelect from './BotConfigSelect'
import axios from 'axios'
import config from '../../config.json'

export default class BotConfigs extends Component {
  static contextType = MultiContext
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  state = {
    configs: [],
    currentConfig: null,
    snackbar: {
      msg: '',
      isOpen: false
    }
  }

  componentWillMount = () => {
    this.getAllConfigs()
    this.getCurrentConfig()
    this.context.setTerminalHeight(0)
  }

  axiosErrorHandler = (err) => {
    let errMsg = err.toString()
    if (typeof err.response !== 'undefined' && typeof err.response.data !== 'undefined' && typeof err.response.data.message !== 'undefined') {
      errMsg = err.response.data.message
    }

    this.setState({
      snackbar: {
        msg: errMsg + ' - See console for more info!',
        isOpen: true
      }
    })
    setTimeout(() => this.setState({ snackbar: { msg: this.state.snackbar.msg, isOpen: false } }), 10000)
  }

  getApiUrl = (controller) => `${config.prefix}${config.socketAdress}${config.apiAdress}${controller}`

  getCurrentConfig = () => {
    if (typeof this.props.match.params.id !== 'undefined') {
      const { id } = this.props.match.params
      axios.get(this.getApiUrl(`getConfig`), { params: { id } })
        .then((res) => {
          console.log(res.data)
        })
        .catch(this.axiosErrorHandler)
    }
  }

  getAllConfigs = () => {
    axios.get(this.getApiUrl(`getAllConfigs`))
      .then((res) => {
        this.setState({ configs: res.data.data })
      })
      .catch(this.axiosErrorHandler)
  }

  deselectAllInArray = (array) => {
    let index = array.findIndex((obj) => obj.selected)
    if (index >= 0) {
      let obj = array[index]
      obj.selected = false
      array[index] = obj
    }
    return array
  }

  onAddClick = (e) => {
    let { configs } = this.state
    if (!configs.find((obj) => obj.key === 'Untitled Config')) {
      configs = this.deselectAllInArray(configs)
      configs.push({ key: 'Untitled Config', selected: true })
    }
    this.setState({ currentConfig: {}, configs })
  }

  onListItemSelect = (key, index) => {
    let { configs } = this.state
    configs = this.deselectAllInArray(configs)
    configs[index].selected = true
    this.setState({ configs })
  }

  render () {
    const { configs, currentConfig, snackbar } = this.state
    return (
      <Fragment>
        <Grid
          item
          xs={12}
          sm={5}
          md={3}
          lg={2}
        >
          <Paper className='paper paper-config paper-config-list' >
            <List>
              <ListItem
                button
                key={'add'}
                onClick={this.onAddClick}
              >
                <ListItemIcon><Add /></ListItemIcon>
                <ListItemText primary={'Add Config'} />
              </ListItem>
              <Divider />
              {configs.map(({ key, selected }, index) => (
                <ListItem
                  button
                  name={key}
                  key={key}
                  selected={selected}
                  onClick={() => this.onListItemSelect(key, index)}
                >
                  <ListItemIcon><Dns /></ListItemIcon>
                  <ListItemText primary={key} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <Paper className='paper paper-config paper-config-editor' >
            {(currentConfig && typeof currentConfig === 'object') ? <BotConfigEditor config={currentConfig} /> : <BotConfigSelect />}
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          open={snackbar.isOpen}
          autoHideDuration={6000}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={snackbar.msg}
        />
      </Fragment>
    )
  }
}
