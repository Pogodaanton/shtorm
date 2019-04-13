import React, { Component } from 'react'
import { Grid, Divider, Button } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import DeleteIcon from '@material-ui/icons/Delete'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'
import CloudDoneIcon from '@material-ui/icons/CloudDone'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

export default class BotConfigEditor extends Component {
  static propTypes = {
    triggerUpdate: PropTypes.func,
    onSelectionChanged: PropTypes.func
  }

  static getDerivedStateFromProps = (props, lastState, b, c) => {
    if (typeof props.config !== 'object') return null
    if (props.config.name === lastState.key) return null
    if (lastState.saveState === 'Save' && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return null

    if (typeof props.onSelectionChanged === 'function') props.onSelectionChanged()
    return { key: props.config.name, ...props.config }
  }

  componentDidMount = () => {
    ValidatorForm.addValidationRule('notEmpty', (value) => {
      if (value.trim() === '') return false
      return true
    })

    ValidatorForm.addValidationRule('wordBlacklist', (value) => {
      if (value.trim() === 'add') return false
      return true
    })
  }

  state = {
    key: '',
    name: '',
    protocol: 'https', // default to 'http'
    server: '', // host name of MediaWiki-powered site
    path: '', // path to api.php script
    debug: false, // is more verbose when set to true
    username: '', // account to be used when logIn is called (optional)
    password: '', // password to be used when logIn is called (optional)
    domain: '', // domain to be used when logIn is called (optional)
    userAgent: '', // define custom bot's user agent
    concurrency: 3, // how many API requests can be run in parallel (defaults to 3)
    saveState: 'Saved' // 'Save': Not Saved, 'Saving': Sending to server, 'Saved': Last version is up to date
  }

  onInputChange = inputName => e => {
    this.setState({ [inputName]: e.target.value })
  }

  onButtonClick = name => e => {
    if (name === 'save') this.saveConfig()
    if (name === 'delete') this.deleteConfig()
  }

  onValidate = (result) => this.setState({ saveState: result ? 'Save' : 'Cannot Save' })

  saveConfig = () => {
    const { key, name, username, password, domain, protocol, server, path, userAgent, concurrency } = this.state
    this.setState({ saveState: 'Saving' })
    axios.post(Api.getApiUrl('saveConfig'), { key, config: { name, username, password, domain, protocol, server, path, userAgent, concurrency } })
      .then((e) => {
        if (typeof e.data !== 'object' || typeof e.data.success !== 'boolean') throw new Error('Wrong answer received!')
        if (e.data.success) {
          this.setState({ saveState: 'Saved' })
          this.props.triggerUpdate()
        }
      })
      .catch(Api.axiosErrorHandler)
  }

  deleteConfig = () => {
    const { key } = this.state
    const removeView = () => {
      this.props.triggerUpdate()
      this.props.onSelectionChanged(true)
    }

    this.setState({ saveState: 'Deleting' })
    axios.post(Api.getApiUrl('deleteConfig'), { key })
      .then((e) => {
        if (typeof e.data !== 'object' || typeof e.data.success !== 'boolean') throw new Error('Wrong answer received!')
        if (e.data.success) removeView()
      })
      .catch((err) => {
        if (err.response.status === 410) removeView()
        else Api.axiosErrorHandler(err)
      })
  }

  render () {
    const { name, username, password, domain, protocol, server, path, userAgent, concurrency, saveState } = this.state

    const CloudIcon = () => {
      switch (saveState) {
        case 'Deleting':
        case 'Saving':
          return <CloudQueueIcon />
        case 'Saved':
          return <CloudDoneIcon />
        default:
          return <CloudUploadIcon />
      }
    }

    const formDisabled = (saveState === 'Saving' || saveState === 'Deleting')

    return (
      <ValidatorForm
        noValidate
        autoComplete='off'
        onSubmit={this.onButtonClick('save')}
      >
        <Grid
          container
          spacing={24}
          alignItems='stretch'
        >
          <Grid
            className='config-editor-grid-form'
            item
            xs={12}
          >
            <TextValidator
              variant='outlined'
              label='Name'
              value={name}
              required
              validators={['notEmpty', 'wordBlacklist']}
              errorMessages={['This field cannot be empty!', 'This name is not allowed!']}
              validatorListener={this.onValidate}
              disabled={formDisabled}
              onChange={this.onInputChange('name')}
            />
            <Divider />
          </Grid>
          <Grid
            className='config-editor-grid-form'
            item
            xs
          >
            <TextValidator
              variant='outlined'
              label='Username'
              required
              validators={['notEmpty']}
              errorMessages={['This field cannot be empty!']}
              validatorListener={this.onValidate}
              value={username}
              disabled={formDisabled}
              onChange={this.onInputChange('username')}
            />
            <TextValidator
              variant='outlined'
              label='Password'
              type='password'
              required
              validators={['notEmpty']}
              errorMessages={['This field cannot be empty!']}
              validatorListener={this.onValidate}
              value={password}
              disabled={formDisabled}
              onChange={this.onInputChange('password')}
            />
            <TextValidator
              variant='outlined'
              label='Login URL'
              required
              validators={['notEmpty']}
              errorMessages={['This field cannot be empty!']}
              validatorListener={this.onValidate}
              value={domain}
              disabled={formDisabled}
              onChange={this.onInputChange('domain')}
            />
          </Grid>
          <Grid
            className='config-editor-grid-form'
            item
            xs
          >
            <TextValidator
              variant='outlined'
              label='Protocol'
              placeholder='e.g.: https'
              value={protocol}
              disabled={formDisabled}
              onChange={this.onInputChange('protocol')}
            />
            <TextValidator
              variant='outlined'
              label='Domain'
              required
              validators={['notEmpty']}
              errorMessages={['This field cannot be empty!']}
              validatorListener={this.onValidate}
              value={server}
              disabled={formDisabled}
              onChange={this.onInputChange('server')}
            />
            <TextValidator
              variant='outlined'
              label='API path'
              placeholder='e.g.: /'
              value={path}
              disabled={formDisabled}
              onChange={this.onInputChange('path')}
            />
            <TextValidator
              variant='outlined'
              label='Custom User Agent'
              value={userAgent}
              disabled={formDisabled}
              onChange={this.onInputChange('userAgent')}
            />
            <TextValidator
              variant='outlined'
              label='Parallel execution limit'
              type='number'
              helperText='How many API requests can be run in parallel (defaults to 3)'
              value={concurrency}
              disabled={formDisabled}
              onChange={this.onInputChange('concurrency')}
            />
          </Grid>
          <Grid
            className='config-editor-grid-buttons'
            item
            xs={12}
          >
            <Button
              className='config-editor-button'
              variant={(saveState === 'Saved' || saveState === 'Deleting') ? 'outlined' : 'contained'}
              disabled={formDisabled || saveState === 'Cannot Save'}
              color='primary'
              type='submit'
            >
              <CloudIcon />
              {saveState}
            </Button>
            <Button
              className='config-editor-button'
              disabled={formDisabled}
              onClick={this.onButtonClick('delete')}
            >
              <DeleteIcon />
              Delete Config
            </Button>
          </Grid>
        </Grid>
      </ValidatorForm>
    )
  }
}
