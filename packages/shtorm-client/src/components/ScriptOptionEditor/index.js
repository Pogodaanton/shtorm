import React, { Component, Fragment } from 'react'
import { FormControlLabel, Checkbox } from '@material-ui/core'
import PropTypes from 'prop-types'
import { TextValidator } from 'react-material-ui-form-validator'
import { withApi } from '../Api'
import axios from 'axios'

class ScriptOptionEditor extends Component {
  static propTypes = {
    defaultValues: PropTypes.object,
    scriptName: PropTypes.string.isRequired,
    onEmptyScriptOptions: PropTypes.func,
    onValuesUpdate: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired,
    disabled: PropTypes.bool
  }

  state = {}

  componentDidMount = () => this.getScriptOptions()

  getScriptOptions = () => {
    axios.get(this.props.api.getApiUrl('getScriptOptions'), { params: { script: this.props.scriptName }, withCredentials: true })
      .then((res) => {
        if (this.props.api.axiosCheckResponse(res)) {
          let scriptOptions = res.data.data

          if (typeof this.props.onEmptyScriptOptions === 'function') {
            this.props.onEmptyScriptOptions(scriptOptions.length <= 0)
          }

          let scriptOptionValues = {}
          scriptOptions.forEach(({ name, value }) => { scriptOptionValues[name] = value })

          // Eliminating obsolete keys from other scripts
          if (this.props.defaultValues) {
            const { defaultValues } = this.props
            const scriptOptionKeys = Object.keys(scriptOptionValues)
            Object.keys(defaultValues).forEach(key => scriptOptionKeys.includes(key) || delete defaultValues[key])
            scriptOptionValues = { ...scriptOptionValues, ...defaultValues }
          }

          this.setState({
            scriptOptions,
            ...scriptOptionValues
          }, () => this.props.onValuesUpdate(scriptOptionValues))
        }
      })
      .catch(this.props.api.axiosErrorHandler(true))
  }

  onInputChange = (name, isCheckbox) => ({ target }) => {
    const updateObj = { [name]: target[isCheckbox ? 'checked' : 'value'] }
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

              if (type === 'boolean') {
                return (
                  <FormControlLabel
                    key={name}
                    control={
                      <Checkbox
                        checked={this.state[name]}
                        onChange={this.onInputChange(name, true)}
                        disabled={!!this.props.disabled}
                        color='primary'
                      />
                    }
                    label={name}
                  />
                )
              }

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

export default withApi(ScriptOptionEditor)
