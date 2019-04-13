import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Paper, Typography, Divider, Chip, Avatar, Fab } from '@material-ui/core'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import AddIcon from '@material-ui/icons/Add'
import PropTypes from 'prop-types'
import NoPresets from './NoPresets'
import Api from '../Api/index'
import axios from 'axios'
import './home.scss'
import DefaultGridItem from '../DefaultGridItem/index'
import AddPreset from '../AddPreset'

export default class index extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  state = {
    location: {},
    presets: [],
    scripts: []
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (typeof prevState.location.pathname === 'undefined' || nextProps.location.pathname !== prevState.location.pathname) {
      return { location: nextProps.location }
    } else return null
  }

  componentDidMount = () => {
    this.getAllPresets()
  }

  getAllPresets = () => {
    axios.get(Api.getApiUrl('getAllPresets'))
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { presets, scripts } = res.data.data
          this.setState({ presets, scripts })
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  render () {
    const { presets, scripts, location } = this.state

    return (
      <DefaultGridItem name='home'>
        <Paper className='paper paper-preset-selector'>
          <Typography variant='h5'>Welcome Back!</Typography>
          <Typography variant='subtitle1'>Choose your next preset you want to execute or create a new one from scratch.</Typography>
          <Divider />
          <div className='preset-selector-scripts'>
            <span>Quick start:</span>
            {scripts.map((scriptName, index) => (
              <Chip
                className='preset-selector-scripts-chip'
                key={scriptName}
                label={scriptName}
                color='secondary'
                avatar={<Avatar><InsertDriveFileIcon /></Avatar>}
                clickable
              />
            ))}
          </div>
          <Divider />
          <div className='preset-selector-presets'>
            {presets.length > 0 ? presets.map(({ name }, index) => null) : <NoPresets />}
          </div>
          <Fab
            color='primary'
            component={Link}
            to='/add'
          >
            <AddIcon />
          </Fab>
        </Paper>
        {(typeof location.pathname !== 'undefined' && location.pathname === '/add') && <AddPreset history={this.props.history} />}
      </DefaultGridItem>
    )
  }
}
