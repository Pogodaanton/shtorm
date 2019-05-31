import React, { Component } from 'react'
import PresetDialog from '../PresetDialog/index'
import PropTypes from 'prop-types'
import axios from 'axios'
import { withSnackbar } from 'notistack'
import Api from '../Api'

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
    this.getPresetData(decodeURIComponent(this.props.match.params.name))
  }

  getPresetData = (name) => {
    axios.get(Api.getApiUrl('getPreset'), { params: { name }, withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          this.setState({ presetData: res.data.data, loading: false })
        }
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar, this.props.history, '/'))
  }

  render () {
    const { loading, presetData } = this.state
    return (
      <PresetDialog
        {...this.props}
        loading={loading}
        presetData={presetData}
      />
    )
  }
}

export default withSnackbar(EditPreset)
