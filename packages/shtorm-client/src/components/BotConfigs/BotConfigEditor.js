import React, { Component, Fragment } from 'react'
import { Prompt } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import { withApi } from '../Api'
import { FormGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Button, Divider } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { CloudUpload, CloudQueue, CloudDone, Delete, FileCopy } from '@material-ui/icons'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import axios from 'axios'
import '../EditorHelpers/EditorHelper.scss'

class BotConfigEditor extends Component {
  static propTypes = {
    onReloadRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  nameList = []
  origState = {}
  state = {
    saveState: 'Saved',
    isNew: false,
    loading: true,
    id: '',
    name: '',
    protocol: 'https',
    server: '',
    path: '',
    debug: true,
    username: '',
    password: '',
    domain: '',
    userAgent: '',
    concurrency: 3
  }

  componentDidMount = () => {
    ValidatorForm.addValidationRule('', () => true)

    ValidatorForm.addValidationRule('notEmpty', (value) => {
      if (value.trim() === '') return false
      return true
    })

    ValidatorForm.addValidationRule('wordBlacklist', (value) => {
      if (value.trim() === 'add') return false
      for (let i in this.nameList) {
        const name = this.nameList[i]
        if (
          (name === value.trim() && typeof this.origState.name === 'undefined') ||
          (name === value.trim() && name !== this.origState.name)
        ) return false
      }
      return true
    })
    this.componentDidUpdate({})
  }

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.match !== this.props.match &&
      typeof this.props.match.params === 'object' &&
      typeof this.props.match.params.id !== 'undefined'
    ) {
      const { id } = this.props.match.params
      this.getTakenConfigNames()
      if (id === 'add') this.setupNewConfig()
      else this.getConfigData(id)
    }
  }

  setupNewConfig = () => {
    this.setState({
      isNew: true,
      loading: false,
      id: 'add',
      saveState: 'Save'
    })
  }

  getTakenConfigNames = () => {
    axios.get(this.props.api.getApiUrl('getAllConfigNames'), { withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.nameList = res.data.data
      })
      .catch(this.props.api.axiosErrorHandler(true))
  }

  getConfigData = (id) => {
    axios.get(this.props.api.getApiUrl('getConfig'), { params: { id }, withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          loading: false,
          ...res.data.data
        }, this.setOrigState)
      })
      .catch((err) => {
        this.props.api.axiosErrorHandler(true)(err)
        this.props.history.replace('/configs')
      })
  }

  setOrigState = () => {
    this.origState = { ...this.state }
    delete this.origState.saveState
  }

  // Custom id and name can be set if f.ex. config wants to duplicate
  postConfigData = (id = this.state.id, name = this.state.name) => () => {
    const {
      protocol,
      server,
      path,
      debug,
      username,
      password,
      domain,
      userAgent,
      concurrency
    } = this.state

    this.setState({
      saveState: 'Saving',
      loading: true
    }, () => {
      axios.post(this.props.api.getApiUrl('saveConfig'), {
        id,
        name,
        protocol,
        server,
        path,
        debug,
        username,
        password,
        domain,
        userAgent,
        concurrency
      }, { withCredentials: true })
        .then((res) => {
          if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')

          if (typeof res.data.newId === 'string') {
            this.props.onReloadRequest()
            this.props.history.replace(`/configs/${res.data.newId}`)
          } else {
            this.setState({ saveState: 'Saved', loading: false }, () => {
              this.props.onReloadRequest()
              this.setOrigState()
            })
          }
        })
        .catch((err) => {
          this.setState({ saveState: 'Save', loading: false })
          this.props.api.axiosErrorHandler(true)(err)
        })
    })
  }

  postDeleteConfig = () => {
    const { id } = this.state

    this.setState({
      saveState: 'Deleting',
      loading: true
    }, () => {
      axios.post(this.props.api.getApiUrl('deleteConfig'), { id }, { withCredentials: true })
        .then((res) => {
          this.props.onReloadRequest()
          this.props.history.replace('/configs')
        })
        .catch((err) => {
          this.setState({ saveState: 'Save', loading: false })
          this.props.api.axiosErrorHandler(true)(err)
        })
    })
  }

  // Config can be cloned by telling the server that it does not have an ID yet. The name needs to be changed as well.
  postCloneConfig = () => this.postConfigData('add', this.state.name + ' (copy)')()

  onInputChange = (input) => (e) => {
    let val = e.target.value
    if (e.target.type === 'checkbox') val = e.target.checked
    this.saveCheck({ [input]: val })
  }

  saveCheck = (addition = {}) => {
    let saveState = 'Saved'
    const diffObj = { ...this.state, ...addition }
    delete diffObj.saveState

    if (!isEqual(diffObj, this.origState)) saveState = 'Save'
    this.setState({ ...addition, saveState })
  }

  render () {
    const {
      saveState,
      isNew,
      loading,
      name,
      protocol,
      server,
      path,
      debug,
      username,
      password,
      domain,
      userAgent,
      concurrency
    } = this.state

    const Cloud = () => {
      switch (saveState) {
        case 'Deleting':
        case 'Saving':
          return <CloudQueue />
        case 'Saved':
          return <CloudDone />
        default:
          return <CloudUpload />
      }
    }

    return (
      <ValidatorForm
        className='editor-form'
        autoComplete='off'
        onSubmit={this.postConfigData()}
      >
        <div className='editor-header bot-config-editor-header'>
          <TextValidator
            variant='filled'
            label='Config Name'
            value={name}
            required
            fullWidth
            validators={['notEmpty', 'wordBlacklist', 'minStringLength:3']}
            errorMessages={['This field cannot be empty!', 'This name is already taken!', 'The name needs to be at least 3 chars long!']}
            disabled={loading}
            onChange={this.onInputChange('name')}
          />
        </div>
        <div className='editor-fieldsets'>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>Authentication Details:</FormLabel>
            <FormGroup>
              <TextValidator
                variant='outlined'
                label='Username'
                value={username}
                required
                fullWidth
                validators={['notEmpty']}
                errorMessages={['This field cannot be empty!']}
                disabled={loading}
                onChange={this.onInputChange('username')}
              />
              <TextValidator
                variant='outlined'
                label='Password'
                type='password'
                value={password}
                validators={['notEmpty']}
                errorMessages={['This field cannot be empty!']}
                disabled={loading}
                required
                fullWidth
                onChange={this.onInputChange('password')}
              />
              <TextValidator
                variant='outlined'
                label='Login URL'
                value={domain}
                validators={['notEmpty']}
                errorMessages={['This field cannot be empty!']}
                disabled={loading}
                required
                fullWidth
                onChange={this.onInputChange('domain')}
              />
              <FormControlLabel
                control={<Checkbox
                  checked={debug}
                  onChange={this.onInputChange('debug')}
                />}
                label='Verbose Bot'
                disabled={loading}
              />
            </FormGroup>
          </FormControl>
          <FormControl component='fieldset'>
            <FormLabel
              component='legend'
              focused={false}
            >Configuration:</FormLabel>
            <FormGroup>
              <TextValidator
                variant='outlined'
                label='Protocol'
                placeholder='e.g.: https'
                value={protocol}
                disabled={loading}
                fullWidth
                onChange={this.onInputChange('protocol')}
              />
              <TextValidator
                variant='outlined'
                label='Domain'
                value={server}
                validators={['notEmpty']}
                errorMessages={['This field cannot be empty!']}
                disabled={loading}
                required
                fullWidth
                onChange={this.onInputChange('server')}
              />
              <TextValidator
                variant='outlined'
                label='API path'
                placeholder='e.g.: /'
                value={path}
                disabled={loading}
                fullWidth
                onChange={this.onInputChange('path')}
              />
              <TextValidator
                variant='outlined'
                label='Custom User Agent'
                value={userAgent}
                disabled={loading}
                fullWidth
                onChange={this.onInputChange('userAgent')}
              />
              <TextValidator
                variant='outlined'
                label='Parallel execution limit'
                type='number'
                helperText='Amount of API requests to run in parallel (defaults to 3)'
                value={concurrency}
                disabled={loading}
                fullWidth
                onChange={this.onInputChange('concurrency')}
              />
            </FormGroup>
          </FormControl>
        </div>
        <div className='editor-submit'>
          <Divider />
          <Button
            type='submit'
            color='primary'
            variant={(saveState === 'Saved' || saveState === 'Deleting') ? 'outlined' : 'contained'}
            disabled={loading}
          >
            <Cloud />
            {saveState}
          </Button>
          {!isNew && (
            <Fragment>
              <Button
                disabled={loading}
                onClick={this.postDeleteConfig}
              >
                <Delete />
                <span>Delete</span>
              </Button>
              <Button
                disabled={loading}
                onClick={this.postCloneConfig}
              >
                <FileCopy />
                <span>Clone</span>
              </Button>
            </Fragment>
          )}
        </div>
        <Prompt
          when={saveState === 'Save'}
          message={() => `You have unsaved changes. Are you sure you want to leave?`}
        />
      </ValidatorForm>
    )
  }
}

export default withApi(withSnackbar(BotConfigEditor))
