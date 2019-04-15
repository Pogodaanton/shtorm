import React, { Component } from 'react'
import PresetDialog from '../PresetDialog/index'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

export default class EditPreset extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    presetData: {}
  }

  componentDidMount = () => {
    console.log(this.props)
    this.getPresetData(decodeURIComponent(this.props.match.params.name))
  }

  getPresetData = (name) => {
    axios.get(Api.getApiUrl('getPreset'), { params: { name } })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          this.setState({ presetData: res.data.data, loading: false })
        }
      })
      .catch(Api.axiosErrorHandler)
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
