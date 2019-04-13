import React, { Component } from 'react'
import { Grid, Paper, Typography, Divider, Chip, Avatar } from '@material-ui/core'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import NoPresets from './NoPresets'
import Api from '../Api/index'
import axios from 'axios'
import './home.scss'
import DefaultGridItem from '../DefaultGridItem/index'

export default class index extends Component {
  state = {
    presets: [],
    scripts: []
  }

  componentDidMount = () => {
    this.getAllPresets()
  }

  getAllPresets = () => {
    axios.get(Api.getApiUrl('getAllPresets'))
      .then((res) => {
        console.log(res)
        if (Api.axiosCheckResponse(res)) {
          const { presets, scripts } = res.data.data
          this.setState({ presets, scripts })
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  render () {
    const { presets, scripts } = this.state

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
        </Paper>
      </DefaultGridItem>
    )
  }
}
