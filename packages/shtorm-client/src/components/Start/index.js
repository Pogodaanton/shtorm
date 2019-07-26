import React, { Component } from 'react'
import { Paper, Button, Typography, Divider, FormControlLabel, Switch } from '@material-ui/core'
import { PlayArrow, SettingsBackupRestore, ArrowBackIos } from '@material-ui/icons'
import { Redirect, Link } from 'react-router-dom'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { withApi } from '../Api'
import { SocketContext } from '../../contexts/SocketContext'
import { UserContext } from '../../contexts/UserContext'
import DefaultGridItem from '../DefaultGridItem'
import PropTypes from 'prop-types'
import ScriptOptionEditor from '../ScriptOptionEditor'
import axios from 'axios'
import isEqual from 'lodash.isequal'
import '../EditorHelpers/EditorHelper.scss'

class Start extends Component {
  static propTypes = {
    api: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired
  }

  scriptOptionsDefaults = {}
  state = {
    isEmpty: false,
    isDefault: true,
    loading: true,
    autoSaveChecked: false,
    scriptName: null,
    scriptOptions: {}
  }

  componentDidMount = () => {
    this.componentDidUpdate({})
    this.props.socket.on('process.start.error', this.processErrorHandler)
    this.props.socket.on('process.start.success', this.processSuccessHandler)
  }

  componentWillUnmount = () => {
    this.props.socket.off('process.start.error', this.processErrorHandler)
    this.props.socket.off('process.start.success', this.processSuccessHandler)
  }

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.match !== this.props.match &&
      typeof this.props.match.params === 'object' &&
      typeof this.props.match.params.id !== 'undefined'
    ) {
      const { id } = this.props.match.params
      if (id) this.getScriptNameFromProject(id)
    }
  }

  getScriptNameFromProject = (project) => {
    const { api, history, currentUser } = this.props
    axios.get(api.getApiUrl('getCustomScriptOptions'), { params: { project, user: currentUser.id }, withCredentials: true })
      .then((res) => {
        if (api.axiosCheckResponse(res)) {
          const { scriptName, defaultOptions, customOptions } = res.data.data
          const autoSaveChecked = Object.keys(customOptions).length > 0
          const scriptOptions = autoSaveChecked ? { ...defaultOptions, ...customOptions } : defaultOptions
          this.scriptOptionsDefaults = defaultOptions

          this.setState({ scriptName, scriptOptions, autoSaveChecked, loading: false })
        }
      })
      .catch(api.axiosErrorHandler(true, history))
  }

  onScriptPreferenceUpdate = (newState) => {
    const scriptOptions = { ...this.state.scriptOptions, ...newState }
    const isDefault = isEqual(scriptOptions, this.scriptOptionsDefaults)

    this.setState({ scriptOptions, isDefault })
  }

  onSubmit = () => {
    this.setState({ loading: true }, () => {
      this.props.socket.emit('process.start', {
        id: this.props.match.params.id,
        scriptOptions: this.state.scriptOptions,
        saveCustomOptions: this.state.autoSaveChecked
      })
    })
  }

  resetOptions = () => {
    const { scriptName } = this.state
    this.setState({
      scriptOptions: this.scriptOptionsDefaults,
      scriptName: null,
      loading: true
    }, () => this.setState({
      scriptName,
      loading: false
    }))
  }

  handleAutosaveToggle = ({ target: { checked: autoSaveChecked } }) => this.setState({ autoSaveChecked })
  processErrorHandler = this.props.api.axiosErrorHandler(true)
  processSuccessHandler = (id) => this.props.history.push(`/p/${encodeURIComponent(id)}`)

  render () {
    const { scriptName, loading, scriptOptions, autoSaveChecked, isDefault } = this.state
    return this.props.match.params.id ? (
      <DefaultGridItem name='start'>
        <Paper className='paper'>
          <ValidatorForm
            className='editor-form'
            onSubmit={this.onSubmit}
            autoComplete='off'
          >
            <div className='editor-header'>
              <Typography variant='h5'>Check the options for this script before starting:</Typography>
              <Divider />
            </div>
            <div className='editor-fieldsets'>
              <fieldset>
                <div>
                  {scriptName ? (
                    <ScriptOptionEditor
                      defaultValues={scriptOptions}
                      scriptName={scriptName}
                      onValuesUpdate={this.onScriptPreferenceUpdate}
                      onEmptyScriptOptions={this.onEmptyScriptOptions}
                      disabled={loading}
                    />
                  ) : 'Please Wait...'}
                </div>
              </fieldset>
            </div>
            <div className='editor-submit'>
              <Divider />
              <Button
                type='submit'
                color='primary'
                variant='contained'
                disabled={loading}
              >
                <PlayArrow />
                Start
              </Button>
              <Button
                onClick={this.resetOptions}
                disabled={loading || isDefault}
              >
                <SettingsBackupRestore />
                {isDefault ? 'Already on defaults' : 'Reset to defaults'}
              </Button>
              <div className='flex-fill' />
              <div className='toggle'>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={loading}
                      checked={autoSaveChecked}
                      onChange={this.handleAutosaveToggle}
                      value='Remember custom changes for later use'
                    />
                  }
                  label='Remember changes'
                />
              </div>
              <Button
                disabled={loading}
                component={Link}
                to='/'
              >
                <ArrowBackIos />
                Go Back
              </Button>
            </div>
          </ValidatorForm>
        </Paper>
      </DefaultGridItem>
    ) : <Redirect to='/' />
  }
}

const ContextAdder = (props) => (
  <SocketContext.Consumer>
    {({ socket }) => (
      <UserContext.Consumer>
        {({ currentUser }) => (
          <Start
            {...props}
            socket={socket}
            currentUser={currentUser}
          />
        )}
      </UserContext.Consumer>
    )}
  </SocketContext.Consumer>
)

export default withApi(ContextAdder)
