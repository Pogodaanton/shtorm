import React, { Component, Fragment } from 'react'
import { Prompt, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Paper, Typography, Button } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import SpotlightLinear from '../Spinners/SpotlightLinear'
import DefaultGridItem from '../DefaultGridItem'
import { SocketContext } from '../../contexts/SocketContext'
import './Task.scss'
import TaskDialog from './TaskDialog'

export default class Start extends Component {
  static contextType = SocketContext
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  uuid = null
  state = {
    progress: 0,
    progressText: null,
    connecting: true,
    error: null,
    finished: false,
    dialog: {},
    dialogOpen: true
  }

  componentWillUnmount = () => {
    this.context.socket.off('process.request.success', this.handleSuccess)
    this.context.socket.off('process.request.error', this.handleError)
    this.context.socket.off('process.killed', this.handleKilled)
    this.context.socket.off('script.progress', this.updateProgress)
    this.context.socket.off('client.disconnect', this.handleDisconnect)
  }

  componentDidMount = () => {
    this.uuid = decodeURIComponent(this.props.match.params.uuid)
    this.context.socket.on('process.request.success', this.handleSuccess)
    this.context.socket.on('process.request.error', this.handleError)
    this.context.socket.on('process.killed', this.handleKilled)
    this.context.socket.on('script.progress', this.updateProgress)
    this.context.socket.on('client.disconnect', this.handleDisconnect)

    this.context.socket.emit('process.request', this.uuid)
  }

  handleSuccess = () => this.setState({ connecting: false, error: null })
  handleError = (error) => this.setState({ error })
  updateProgress = ({ progress, progressText, finished, dialog }) => this.setState({ progress, progressText, finished, dialog })
  handleDisconnect = () => this.setState({ error: 'You have been disconnected from the bot process, as a new client connected to it.' })
  handleKilled = () => !this.state.finished && this.setState({ error: 'You have been disconnected from the process socket, as it was killed.' })

  handleDialogClose = () => this.setState({ dialog: {}, dialogOpen: true })
  toggleDialog = () => this.setState({ dialogOpen: !this.state.dialogOpen })

  render () {
    const { progress, connecting, error, finished, progressText, dialog, dialogOpen } = this.state
    const hasDialogKeys = Object.keys(dialog).length > 0
    return (
      <DefaultGridItem name='task'>
        <Paper className='paper'>
          <Prompt
            when={!error && !finished}
            message='If you leave this page, you could potentially break the functionality of your running script! Are you willing to take this risk?'
          />
          {error ? (
            <div className='spotlight spotlight-task-error'>
              <Typography variant='h5' >{error}</Typography>
              <Button
                color='primary'
                component={Link}
                to='/'
              ><HomeIcon />Go back to Dashboard</Button>
            </div>
          ) : finished ? (
            <div className='spotlight spotlight-task-success'>
              <Typography variant='h5' >Script executed successfully!</Typography>
              <Button
                color='primary'
                component={Link}
                to='/'
              ><HomeIcon />Go back to Dashboard</Button>
            </div>
          ) : (
            <Fragment>
              <SpotlightLinear
                value={progress}
                msg={connecting ? 'Connecting to Socket' : hasDialogKeys ? 'The bot needs input from you!' : progressText || 'Please wait while the script is doing its thing.'}
              >
                {hasDialogKeys ? (
                  <Button
                    color='primary'
                    onClick={this.toggleDialog}
                    className='dialogButton'
                  >
                    <OpenInBrowserIcon />
                    Open Dialog
                  </Button>
                ) : null}
              </SpotlightLinear>
            </Fragment>
          )}
          <TaskDialog
            open={hasDialogKeys && dialogOpen}
            dialog={dialog}
            socket={this.context.socket}
            handleClose={this.handleDialogClose}
            handleHide={this.toggleDialog}
          />
        </Paper>
      </DefaultGridItem>
    )
  }
}
