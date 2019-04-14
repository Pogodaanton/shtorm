import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { ValidatorForm, SelectValidator } from 'react-material-ui-form-validator'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Stepper,
  Typography,
  Step,
  StepLabel,
  withWidth
} from '@material-ui/core'
import axios from 'axios'
import Api from '../Api'
import './AddPreset.scss'

const stepperOrientation = {
  'xs': 'vertical',
  'sm': 'vertical',
  'md': 'horizontal',
  'lg': 'horizontal',
  'xl': 'horizontal'
}

class AddPreset extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired
  }

  state = {
    open: false,
    loading: true,
    scripts: [],
    configs: [],
    options: [],
    selectedScript: '',
    selectedConfig: '',
    currentStep: 0,
    skippedSteps: {}
  };

  componentDidMount = () => {
    this.getDropdownData()
    this.setState({ open: true })
  };

  getDropdownData = () => {
    axios.get(Api.getApiUrl('getAllScripts'))
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { scripts, configs } = res.data.data
          this.setState({ scripts, configs, loading: false })
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  getScriptOptions = () => {
    this.setState({ loading: true })
    axios.get(Api.getApiUrl('getScriptOptions'))
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          let { currentStep, skippedSteps } = this.state
          const options = res.data.data
          if (options.length <= 0) {
            skippedSteps[currentStep] = true
            currentStep++
          }
          this.setState({ options: res.data.data, currentStep, skippedSteps, loading: false })
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

  onFormValidate = (e) => {
    const { currentStep } = this.state
    if (currentStep === 0) this.getScriptOptions()
    if (currentStep < this.getSteps().length) this.triggerNext(e)
  }

  getSteps = () => {
    const { skippedSteps } = this.state
    return [
      { title: 'Select config and script', skipped: skippedSteps[0] },
      { title: 'Tweak script specific settings', skipped: skippedSteps[1] },
      { title: 'Check your changes', skipped: skippedSteps[2] }
    ]
  }

  getStepContent = (step) => {
    const { scripts, configs, selectedScript, selectedConfig } = this.state
    const scriptSelectDisabled = (scripts.length <= 0)
    const configSelectDisabled = (configs.length <= 0)
    switch (step) {
      case 0:
        return (
          <Fragment>
            <DialogContentText>
              First, let&apos;s decide, which script and config we should use for this preset.
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
        )
      case 1:
        return 'What is an ad group anyways?'
      case 2:
        const allItems = { selectedConfig, selectedScript }
        return (
          <Fragment>
            <DialogContentText>
              Alright, here&apos;s everything you set for this preset.
            </DialogContentText>
            <div className='preset-add-dialog-results'>
              {Object.keys(allItems).map((key, index) => {
                const title = key.substr(8)
                const value = allItems[key]
                return (
                  <div
                    className='preset-add-dialog-result'
                    key={title}
                  >
                    <Typography
                      variant='button'
                      className='preset-add-dialog-result-title'
                    >{title}: </Typography>
                    <Typography
                      variant='body2'
                      className='preset-add-dialog-result-value'
                    >{value}</Typography>
                  </div>
                )
              })}
            </div>
          </Fragment>
        )
      default:
        return <DialogContentText>I don&apos;t know how you got here, but this shouldn&apos;t happen.</DialogContentText>
    }
  }

  triggerNext = () => {
    this.setState(state => ({
      currentStep: state.currentStep + 1
    }))
  };

  triggerBack = () => {
    let { options, currentStep } = this.state
    if (currentStep === 2 && options.length <= 0) currentStep--
    this.setState({
      currentStep: currentStep - 1
    })
  };

  triggerReset = () => {
    this.setState({
      currentStep: 0
    })
  };

  render () {
    const { open, loading, currentStep } = this.state
    const steps = this.getSteps()

    return (
      <Dialog
        open={open}
        onClose={this.onDialogClose}
        className='preset-add-dialog'
        aria-labelledby='preset-add-dialog-title'
        maxWidth='md'
        fullWidth
      >
        <ValidatorForm onSubmit={this.onFormValidate}>
          <DialogTitle id='preset-add-dialog-title'>
            Add Preset
            <Stepper
              orientation={stepperOrientation[this.props.width]}
              activeStep={currentStep}
              className='preset-add-dialog-stepper'
            >
              {steps.map((obj, index) => {
                return (
                  <Step key={obj.title} >
                    <StepLabel
                      optional={obj.skipped ? <Typography variant='caption'>Skipped: No preferences available</Typography> : null}
                    >{obj.title}</StepLabel>
                  </Step>
                )
              })}
            </Stepper>
          </DialogTitle>
          {loading ? (
            <DialogContent>
              <CircularProgress style={{ marginRight: 15 }} />Preparing some stuff...
            </DialogContent>
          ) : currentStep === steps.length ? (
            <Fragment>
              <DialogContent>
                <DialogContentText> All steps completed - you&apos;re finished </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.onDialogClose}
                  disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                  color='primary'
                  disabled={loading}
                  onClick={this.triggerReset}
                >
                    Reset
                </Button>
              </DialogActions>
            </Fragment>
          ) : (
            <Fragment>
              <DialogContent>{this.getStepContent(currentStep)}</DialogContent>
              <DialogActions>
                <Button
                  disabled={currentStep === 0}
                  onClick={this.triggerBack}
                >
                  Back
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </DialogActions>
            </Fragment>
          )}
        </ValidatorForm>
      </Dialog>
    )
  }
}

export default withWidth()(AddPreset)
