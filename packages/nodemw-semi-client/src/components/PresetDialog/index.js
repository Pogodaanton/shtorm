import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { ValidatorForm, TextValidator, SelectValidator } from 'react-material-ui-form-validator'
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
import './PresetDialog.scss'

const stepperOrientation = {
  'xs': 'vertical',
  'sm': 'vertical',
  'md': 'horizontal',
  'lg': 'horizontal',
  'xl': 'horizontal'
}

class PresetDialog extends Component {
  static propTypes = {
    presetData: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired
  }

  shouldScriptOptionsUpdate = true
  state = {
    open: false,
    loading: true,
    scripts: [],
    configs: [],
    currentStep: 0,
    skippedSteps: {},
    scriptOptions: [],
    options: {
      name: '',
      script: '',
      config: ''
    }
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.presetData !== this.props.presetData) {
      this.getDropdownData()
      this.setState({ options: { ...this.state.options, ...this.props.presetData } })
    }
  }

  componentDidMount = () => {
    this.getDropdownData()
    this.setState({ open: true, options: { ...this.state.options, ...this.props.presetData } })
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
          const scriptOptions = res.data.data
          if (scriptOptions.length <= 0) skippedSteps[currentStep + 1] = true
          this.shouldScriptOptionsUpdate = false
          this.setState({ scriptOptions, skippedSteps, loading: false })
          this.triggerNext()
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  savePreset = () => {
    this.setState({ loading: true })
    axios.post(Api.getApiUrl('savePreset'), { key: this.state.name, preset: this.getAllOptions() })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          console.log(res)
          this.closeDialog()
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  closeDialog = () => {
    this.setState({ open: false })
    setTimeout(() => this.props.history.push('/'), 205)
  }

  onOptionValueChange = name => e => {
    const { options } = this.state
    if (name === 'script') this.shouldScriptOptionsUpdate = true
    options[name] = e.target.value
    this.setState({ options })
  }

  onScriptPreferenceChange = name => e => {
    let { scriptOptions } = this.state
    scriptOptions = scriptOptions.map((item) => {
      if (item.name === name) item.value = e.target.value
      return item
    })
    this.setState({ scriptOptions })
  }

  onFormValidate = (e) => {
    const { currentStep } = this.state
    if (currentStep === this.getSteps().length - 1) this.savePreset()
    if (currentStep === 0 && this.shouldScriptOptionsUpdate) this.getScriptOptions()
    else this.triggerNext(e)
  }

  getAllOptions = () => {
    const { scriptOptions, options: allOptions } = this.state
    scriptOptions.forEach(({ name, value }) => { allOptions[name] = value })
    return allOptions
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

  getSteps = () => {
    const { skippedSteps } = this.state
    return [
      { title: 'Select config and script', skipped: skippedSteps[0] },
      { title: 'Tweak script specific settings', skipped: skippedSteps[1] },
      { title: 'Check your changes', skipped: skippedSteps[2] }
    ]
  }

  getStepContent = (step) => {
    const { scripts, options, configs, scriptOptions } = this.state
    const { name, script, config } = options
    const scriptSelectDisabled = (scripts.length <= 0)
    const configSelectDisabled = (configs.length <= 0)
    switch (step) {
      case 0:
        return (
          <Fragment>
            <DialogContentText className='preset-add-dialog-select-title'>
              First, give the preset a name and let&apos;s decide, which script and config we want to use for it.
            </DialogContentText>
            <TextValidator
              id='preset-add-dialog-select-name'
              variant='outlined'
              margin='dense'
              fullWidth
              value={name}
              label='Preset name:'
              validators={['required']}
              errorMessages={['This field cannot be empty.']}
              onChange={this.onOptionValueChange('name')}
            />
            <SelectValidator
              id='preset-add-dialog-select-script'
              select
              variant='outlined'
              label={scriptSelectDisabled ? 'No scripts available, create a script first.' : 'Select a script:'}
              disabled={scriptSelectDisabled}
              value={script}
              onChange={this.onOptionValueChange('script')}
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
              variant='outlined'
              label={configSelectDisabled ? 'No configs available, create a config first.' : 'Select a config:'}
              disabled={configSelectDisabled}
              value={config}
              onChange={this.onOptionValueChange('config')}
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
        return (
          <Fragment>
            <DialogContentText className='preset-add-dialog-select-title'>
              Your script has some preferences which need to be set.
            </DialogContentText>
            {scriptOptions.map(({ type, name, value }) => {
              const inputType = this.getAllowedType(type)
              return (
                <TextValidator
                  key={name}
                  variant='outlined'
                  type={inputType}
                  margin='dense'
                  fullWidth
                  required
                  value={value}
                  label={name}
                  validators={['required']}
                  errorMessages={['This field cannot be empty.']}
                  onChange={this.onScriptPreferenceChange(name)}
                />
              )
            })}
          </Fragment>
        )
      case 2:
        const allPreferences = this.getAllOptions()
        return (
          <Fragment>
            <DialogContentText>
              Alright, here&apos;s everything you set for this preset.
            </DialogContentText>
            <div className='preset-add-dialog-results'>
              {Object.keys(allPreferences).map((key, index) => {
                const value = allPreferences[key]
                return (
                  <div
                    className='preset-add-dialog-result'
                    key={key}
                  >
                    <Typography
                      variant='button'
                      className='preset-add-dialog-result-title'
                    >{key}: </Typography>
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
    let { currentStep, skippedSteps } = this.state
    currentStep++
    if (skippedSteps[currentStep] === true) currentStep++
    this.setState({ currentStep })
  };

  triggerBack = () => {
    let { currentStep, skippedSteps } = this.state
    currentStep--
    if (skippedSteps[currentStep] === true) currentStep--
    this.setState({ currentStep })
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
        onClose={this.closeDialog}
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
                  color='primary'
                  disabled={loading}
                  onClick={this.closeDialog}
                >
                  Close
                </Button>
              </DialogActions>
            </Fragment>
          ) : (
            <Fragment>
              <DialogContent>{this.getStepContent(currentStep)}</DialogContent>
              <DialogActions>
                <Button
                  disabled={loading || currentStep === 0}
                  onClick={this.triggerBack}
                >
                  Back
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
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

export default withWidth()(PresetDialog)
