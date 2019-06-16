import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { TextValidator } from 'react-material-ui-form-validator'
import { withSnackbar } from 'notistack'
import axios from 'axios'
import Api from '../Api'

class ScriptOptionEditor extends Component {
  static propTypes = {
    defaultValues: PropTypes.object,
    scriptName: PropTypes.string.isRequired,
    onEmptyScriptOptions: PropTypes.func,
    onValuesUpdate: PropTypes.func.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
    closeSnackbar: PropTypes.func.isRequired,
    disabled: PropTypes.bool
  }

  state = {}

  componentDidMount = () => this.getScriptOptions()

  getScriptOptions = () => {
    axios.get(Api.getApiUrl('getScriptOptions'), { params: { script: this.props.scriptName }, withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          let scriptOptions = res.data.data

          if (typeof this.props.onEmptyScriptOptions === 'function') {
            this.props.onEmptyScriptOptions(scriptOptions.length <= 0)
          }

          let scriptOptionValues = {}
          scriptOptions.forEach(({ name, value }) => { scriptOptionValues[name] = value })
          if (this.props.defaultValues) scriptOptionValues = { ...scriptOptionValues, ...this.props.defaultValues }

          this.setState({
            scriptOptions,
            ...scriptOptionValues
          }, () => this.props.onValuesUpdate(scriptOptionValues))
        }
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
  }

  onInputChange = (name) => ({ target }) => {
    const updateObj = { [name]: target.value }
    this.setState(updateObj, () => this.props.onValuesUpdate(updateObj))
  }

  getAllowedType = (proposedType) => {
    switch (proposedType) {
      case 'number':
        return 'number'
      case 'password':
        return 'password'
      default:
        return 'text'
    }
  }

  render () {
    const { scriptOptions } = this.state

    return (
      <Fragment>
        {typeof scriptOptions !== 'object'
          ? 'Please Wait...'
          : scriptOptions.length <= 0
            ? 'There are no custom settings available for this script.'
            : scriptOptions.map(({ type, name }) => {
              const inputType = this.getAllowedType(type)
              return (
                <TextValidator
                  key={name}
                  variant='outlined'
                  type={inputType}
                  margin='dense'
                  fullWidth
                  required
                  value={this.state[name]}
                  label={name}
                  validators={['required']}
                  errorMessages={['This field cannot be empty.']}
                  onChange={this.onInputChange(name)}
                  disabled={!!this.props.disabled}
                />
              )
            })
        }
      </Fragment>
    )
  }
}

export default withSnackbar(ScriptOptionEditor)
