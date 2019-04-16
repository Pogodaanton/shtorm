import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Paper, Typography, Divider, Chip, Avatar, Fab, Tooltip } from '@material-ui/core'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import AddIcon from '@material-ui/icons/Add'
import RefreshIcon from '@material-ui/icons/Refresh'
import PropTypes from 'prop-types'
import NoPresets from './NoPresets'
import Api from '../Api/index'
import axios from 'axios'
import './home.scss'
import DefaultGridItem from '../DefaultGridItem/index'
import AddPreset from './AddPreset'
import EditPreset from './EditPreset'
import DeletePreset from './DeletePreset'
import PresetTable from './PresetTable'
import Fullscreen from '../Spinners/Fullscreen'

export default class index extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    location: {},
    presets: [],
    scripts: []
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (typeof prevState.location.pathname === 'undefined' || nextProps.location.pathname !== prevState.location.pathname) {
      return { location: nextProps.location }
    } else return null
  }

  componentDidUpdate = (prevProps) => {
    if (typeof prevProps.location.pathname !== 'undefined' && prevProps.location.pathname !== this.state.location.pathname && this.state.location.pathname === '/') {
      this.getAllPresets()
    }
  }

  componentDidMount = () => {
    this.getAllPresets()
  }

  getAllPresets = () => {
    this.setState({ loading: true })
    axios.get(Api.getApiUrl('getAllPresets'))
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { presets, scripts } = res.data.data
          this.setState({ presets, scripts, loading: false })
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  render () {
    const { loading, presets, scripts, location } = this.state

    return (
      <DefaultGridItem name='home'>
        <Paper className='paper paper-preset-selector'>
          <Typography variant='h5'>Welcome Back!</Typography>
          <Typography variant='subtitle1'>Choose the next preset you want to execute or create a new one from scratch.</Typography>
          <Divider />
          <div className='preset-selector-scripts'>
            <Typography variant='body1'>Quick start:</Typography>
            {scripts.length <= 0 ? (
              <Typography
                className='preset-selector-scripts-empty'
                variant='body2'
              >You have no scripts in your directory.</Typography>
            ) : scripts.map((scriptName, index) => (
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
            {presets.length > 0 ? <PresetTable rows={presets} /> : <NoPresets />}
          </div>
          <div className='preset-selector-fabs'>
            <Tooltip title='Refresh list'>
              <Fab
                size='small'
                onClick={this.getAllPresets}
              >
                <RefreshIcon />
              </Fab>
            </Tooltip>
            <Tooltip title='Create a new preset'>
              <Fab
                color='primary'
                component={Link}
                to='/add'
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </div>
        </Paper>
        {(typeof location.pathname !== 'undefined' && location.pathname.substr(0, 4) === '/add') && <AddPreset history={this.props.history} />}
        {(typeof location.pathname !== 'undefined' && location.pathname.substr(0, 6) === '/edit/') && <EditPreset {...this.props} />}
        {(typeof location.pathname !== 'undefined' && location.pathname.substr(0, 8) === '/delete/') && <DeletePreset {...this.props} />}
        {loading && <Fullscreen />}
      </DefaultGridItem>
    )
  }
}
