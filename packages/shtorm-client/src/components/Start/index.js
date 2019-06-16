import React, { Component } from 'react'
import { Paper, Button, Typography, Divider } from '@material-ui/core'
import { PlayArrow, FastForward, ArrowBackIos } from '@material-ui/icons'
import { Redirect, Link } from 'react-router-dom'
import { ValidatorForm } from 'react-material-ui-form-validator'
import { withSnackbar } from 'notistack'
import { SocketContext } from '../../contexts/SocketContext'
import DefaultGridItem from '../DefaultGridItem'
import PropTypes from 'prop-types'
import ScriptOptionEditor from '../ScriptOptionEditor'
import axios from 'axios'
import Api from '../Api'
import '../EditorHelpers/EditorHelper.scss'

class Start extends Component {
  static contextType = SocketContext
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  scriptOptionsDefaults = {}
  state = {
    isEmpty: false,
    loading: true,
    scriptName: null,
    scriptOptions: {}
  }

  componentDidMount = () => {
    this.componentDidUpdate({})
    this.context.socket.on('process.start.error', this.processErrorHandler)
    this.context.socket.on('process.start.success', this.processSuccessHandler)
  }

  componentWillUnmount = () => {
    this.context.socket.off('process.start.error', this.processErrorHandler)
    this.context.socket.off('process.start.success', this.processSuccessHandler)
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

  getScriptNameFromProject = (id) => {
    axios.get(Api.getApiUrl('getProject'), { params: { id }, withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { script, scriptOptions } = res.data.data
          this.scriptOptionsDefaults = scriptOptions
          this.setState({ scriptName: script, scriptOptions, loading: false })
        }
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar, this.props.history))
  }

  onScriptPreferenceUpdate = (newState) => {
    this.setState({ scriptOptions: { ...this.state.scriptOptions, newState } })
  }

  onSubmit = (defaults = false) => () => {
    this.context.socket.emit('process.start', {
      id: this.props.match.params.id,
      scriptOptions: defaults ? this.scriptOptionsDefaults : this.state.scriptOptions
    })
  }

  processErrorHandler = Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)
  processSuccessHandler = (id) => this.props.history.push(`/p/${encodeURIComponent(id)}`)

  render () {
    const { scriptName, loading, scriptOptions } = this.state
    return this.props.match.params.id ? (
      <DefaultGridItem name='start'>
        <Paper className='paper'>
          <ValidatorForm
            className='editor-form'
            onSubmit={this.onSubmit()}
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
                onClick={this.onSubmit(true)}
                disabled={loading}
              >
                <FastForward />
                Start with defaults
              </Button>
              <div className='flex-fill' />
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

export default withSnackbar(Start)
