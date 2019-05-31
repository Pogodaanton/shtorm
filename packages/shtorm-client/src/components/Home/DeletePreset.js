import React, { Component } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'
import { withSnackbar } from 'notistack'
import SpinnerFullscreen from '../Spinners/Fullscreen'

class EditPreset extends Component {
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
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
    axios.post(Api.getApiUrl('deletePreset'), { name }, { withCredentials: true })
      .then((res) => {
        this.props.history.replace('/')
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar, this.props.history, '/'))
  }

  render () {
    return <SpinnerFullscreen />
  }
}

export default withSnackbar(EditPreset)
