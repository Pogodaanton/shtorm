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
  ListItemIcon,
  Stepper,
  Typography,
  Step,
  StepLabel,
  withWidth
} from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import { withSnackbar } from 'notistack'
import axios from 'axios'
import Api from '../Api'
import Loader from '../Loader'
import './ProjectDialog.scss'

const ScriptOptionEditor = Loader(import('../ScriptOptionEditor'), () => 'Please Wait...')
const stepperOrientation = {
  'xs': 'vertical',
  'sm': 'vertical',
  'md': 'horizontal',
  'lg': 'horizontal',
  'xl': 'horizontal'
}

class ProjectDialog extends Component {
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired
  }

  shouldScriptOptionsUpdate = true
  crawledOptions = {}
  state = {
    open: true,
    loading: true,
    scripts: [],
    configs: [],
    currentStep: 0,
    skippedSteps: {},
    scriptOptions: {},
    options: {
      id: '',
      name: '',
      script: '',
      config: ''
    }
  };

  componentDidMount = () => this.componentDidUpdate({})

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.match !== this.props.match &&
      typeof this.props.match.params === 'object' &&
      typeof this.props.match.params.id !== 'undefined'
    ) {
      const { id } = this.props.match.params
      if (id === 'add') this.setState({ options: { ...this.state.options, id } })
      else this.getProjectData(id)
      this.getDropdownData()
    }
  }

  getProjectData = (id) => {
    axios.get(Api.getApiUrl('getProject'), { params: { id }, withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res) && typeof res.data.data === 'object') {
          const { data } = res.data
          const projectOptions = { ...data }
          delete projectOptions['scriptOptions']
          this.setState({ options: projectOptions, scriptOptions: data.scriptOptions })
        } else throw new Error('Wrong format received!')
      })
      .catch((err) => {
        Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
        this.props.history.replace('/')
      })
  }

  getDropdownData = () => {
    axios.get(Api.getApiUrl('getAllScripts'), { withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { scripts, configs } = res.data.data
          this.setState({ scripts, configs, loading: false })
        }
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
  }

  setScriptOptions = (scriptOptions) => {
    return scriptOptions.map((obj) => {
      obj.value = (this.state.options[obj.name] || '')
      return obj
    })
  }

  saveProject = () => {
    const { options, scriptOptions } = this.state
    this.setState({ loading: true })

    axios.post(Api.getApiUrl('saveProject'), { ...options, scriptOptions }, { withCredentials: true })
      .then((res) => this.closeDialog())
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
  }

  deleteProject = () => {
    this.setState({ loading: true })
    axios.post(Api.getApiUrl('deleteProject'), { id: this.state.options.id }, { withCredentials: true })
      .then((res) => this.closeDialog())
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
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

  onScriptPreferenceUpdate = changes => {
    let { scriptOptions } = this.state
    this.setState({ scriptOptions: { ...scriptOptions, ...changes } })
  }

  onEmptyScriptOptions = (value = false) => {
    const { skippedSteps } = this.state
    skippedSteps[1] = value
    this.setState(skippedSteps)
  }

  onFormValidate = (e) => {
    const { currentStep } = this.state
    if (currentStep === this.getSteps().length - 1) this.saveProject()
    else this.triggerNext(e)
  }

  getAllOptions = () => {
    const { scriptOptions } = this.state
    const { name, script, config: configId } = this.state.options
    const config = this.getConfigNameFromId(configId)

    return { name, script, config, ...scriptOptions }
  }

  getConfigNameFromId = (configId) => {
    return this.state.configs
      .filter(({ id }) => id === configId)
      .map(({ name }) => name)
      .join('')
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
    const { scripts, options, configs } = this.state
    const { name, script, config } = options
    const scriptSelectDisabled = (scripts.length <= 0)
    const configSelectDisabled = (configs.length <= 0)
    switch (step) {
      case 0:
        return (
          <Fragment>
            <DialogContentText className='project-editor-dialog-select-title'>
              First, give the project a name and decide, which script and config you want to use for it.
            </DialogContentText>
            <TextValidator
              id='project-editor-dialog-select-name'
              variant='outlined'
              margin='dense'
              fullWidth
              value={name}
              label='Project name:'
              validators={['required']}
              errorMessages={['This field cannot be empty.']}
              onChange={this.onOptionValueChange('name')}
            />
            <SelectValidator
              id='project-editor-dialog-select-script'
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
              className='project-editor-dialog-select-config'
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
              {configs.map(({ id, name, favicon }) => (
                <MenuItem
                  key={id}
                  value={id}
                  className='project-editor-dialog-select-config-item'
                >
                  <ListItemIcon>
                    <img
                      src={favicon}
                      alt={`Favicon for config ${name}`}
                      width={16}
                      height={16}
                    />
                  </ListItemIcon>
                  {name}
                </MenuItem>
              ))}
            </SelectValidator>
          </Fragment>
        )
      case 1:
        return (
          <Fragment>
            <DialogContentText className='project-editor-dialog-select-title'>
              Your script has some preferences which need to be set.
            </DialogContentText>
            <ScriptOptionEditor
              defaultValues={this.state.scriptOptions}
              scriptName={this.state.options.script}
              onValuesUpdate={this.onScriptPreferenceUpdate}
              onEmptyScriptOptions={this.onEmptyScriptOptions}
            />
          </Fragment>
        )
      case 2:
        const allOptions = this.getAllOptions()
        return (
          <Fragment>
            <DialogContentText>
              Alright, here&apos;s everything you&apos;ve set for this project.
            </DialogContentText>
            <div className='project-editor-dialog-results'>
              {Object.keys(allOptions).map((key, index) => {
                const value = allOptions[key]
                return (
                  <div
                    className='project-editor-dialog-result'
                    key={key}
                  >
                    <Typography
                      variant='button'
                      className='project-editor-dialog-result-title'
                    >{key}: </Typography>
                    <Typography
                      variant='body2'
                      className='project-editor-dialog-result-value'
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
    const { open, loading, currentStep, options } = this.state
    const steps = this.getSteps()

    return (
      <Dialog
        open={open}
        onClose={this.closeDialog}
        className='project-editor-dialog'
        aria-labelledby='project-editor-dialog-title'
        maxWidth='md'
        fullWidth
      >
        <ValidatorForm
          onSubmit={this.onFormValidate}
          autoComplete='off'
        >
          <DialogTitle id='project-editor-dialog-title'>
            {this.state.options.id === 'add' ? 'Add Project' : 'Edit Project'}
            <Stepper
              orientation={stepperOrientation[this.props.width]}
              activeStep={currentStep}
              className='project-editor-dialog-stepper'
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
                {(options.id && options.id !== 'add') && (
                  <Button
                    disabled={loading}
                    onClick={this.deleteProject}
                    color='primary'
                  >
                    <Delete />
                    Delete Project
                  </Button>
                )}
                <div className='flex-fill' />
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

export default withSnackbar(withWidth()(ProjectDialog))
