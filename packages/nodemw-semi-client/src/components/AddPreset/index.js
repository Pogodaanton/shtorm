import React, { Fragment } from 'react'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@material-ui/core'
import { ValidatorForm, SelectValidator } from 'react-material-ui-form-validator'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api/index'

export default class AddPreset extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  state = {
    open: false,
    loading: true,
    scripts: [],
    configs: [],
    selectedScript: '',
    selectedConfig: ''
  };

  componentDidMount = () => {
    this.setState({ open: true })
    this.getDropdownData()
  };

  getDropdownData = () => {
    axios.get(Api.getApiUrl('getAllScripts'))
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { scripts, configs } = res.data.data
          console.log(res.data)
          this.setState({ scripts, configs, loading: false })
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  onDialogClose = () => {
    this.setState({ open: false })
    setTimeout(() => this.props.history.push('/'), 205)
  }

  onDropdownChange = name => event => {
    this.setState({ [`selected${name}`]: event.target.value })
  }

  onFormValidate = (a, b) => {
    console.log({ a, b })
  }

  render () {
    const { open, loading, scripts, configs, selectedScript, selectedConfig } = this.state
    const scriptSelectDisabled = (scripts.length <= 0)
    const configSelectDisabled = (configs.length <= 0)

    return (
      <Dialog
        open={open}
        onClose={this.onDialogClose}
        aria-labelledby='preset-add-dialog-title'
      >
        <ValidatorForm onSubmit={this.onFormValidate}>
          <DialogTitle id='preset-add-dialog-title'>Add Preset</DialogTitle>
          <DialogContent>
            {loading ? (
              <Fragment>
                <CircularProgress style={{ marginRight: 15 }} />Preparing some stuff...
              </Fragment>
            ) : (
              <Fragment>
                <DialogContentText>
              To subscribe to this website, please enter your email address here. We will send
              updates occasionally.
                </DialogContentText>
                <SelectValidator
                  id='preset-add-dialog-select-script'
                  select
                  label={scriptSelectDisabled ? 'No scripts available, create a script first.' : 'Select a script:'}
                  disabled={scriptSelectDisabled}
                  value={selectedScript}
                  onChange={this.onDropdownChange('Script')}
                  validators={['required']}
                  errorMessages={['This field cannot be empty.']}
                  margin='dense'
                  fullWidth
                >
                  {scripts.map(option => (
                    <MenuItem
                      key={option}
                      value={option}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </SelectValidator>
                <SelectValidator
                  id='preset-add-dialog-select-config'
                  select
                  label={configSelectDisabled ? 'No configs available, create a config first.' : 'Select a config:'}
                  disabled={configSelectDisabled}
                  value={selectedConfig}
                  onChange={this.onDropdownChange('Config')}
                  validators={['required']}
                  errorMessages={['This field cannot be empty.']}
                  margin='dense'
                  fullWidth
                >
                  {configs.map(option => (
                    <MenuItem
                      key={option.name}
                      value={option.name}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </SelectValidator>
              </Fragment>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.onDialogClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              color='primary'
              disabled={loading}
            >
              Create Preset
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    )
  }
}
