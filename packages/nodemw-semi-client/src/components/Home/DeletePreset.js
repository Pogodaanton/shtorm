import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'
import SpinnerFullscreen from '../Spinners/Fullscreen'

export default class EditPreset extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    presetData: {}
  }

  componentDidMount = () => {
    this.deletePreset(decodeURIComponent(this.props.match.params.name))
  }

  deletePreset = (name) => {
    axios.post(Api.getApiUrl('deletePreset'), { name })
      .then((res) => {
        this.props.history.replace('/')
      })
      .catch((err) => {
        Api.axiosErrorHandler(err)
        this.props.history.replace('/')
      })
  }

  render () {
    return <SpinnerFullscreen />
  }
}
