import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { SocketContext } from '../../contexts/SocketContext'
import { Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions, Button } from '@material-ui/core'

export default class EditPreset extends PureComponent {
  static contextType = SocketContext
  static propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired
  }

  shouldRedirectOnSuccess = false
  state = {
    open: true,
    loading: false,
    error: null
  }

  componentDidMount = () => {
    this.context.socket.on('task.start.error', this.taskErrorHandler)
    this.context.socket.on('task.start.success', this.taskSuccessHandler)
  }

  componentWillUnmount = () => {
    this.context.socket.off('task.start.error', this.taskErrorHandler)
    this.context.socket.off('task.start.success', this.taskSuccessHandler)
  }

  closeDialog = (e, eventName, path = '/') => {
    this.setState({ open: false })
    setTimeout(() => this.props.history.push(path), 205)
  }

  startTask = (shouldRedirectOnSuccess) => () => {
    if (shouldRedirectOnSuccess) this.shouldRedirectOnSuccess = true
    const name = decodeURIComponent(this.props.match.params.name)
    this.context.socket.emit('task.start', name)
  }

  taskErrorHandler = (error) => this.setState({ error })
  taskSuccessHandler = (uuid) => {
    if (this.shouldRedirectOnSuccess) this.closeDialog(null, null, `/task/${encodeURIComponent(uuid)}`)
    else this.closeDialog()
  }

  render () {
    const { open, loading, error } = this.state
    return (
      <Dialog
        open={open}
        onClose={this.closeDialog}
      >
        {error ? (
          <Fragment>
            <DialogTitle>Script initializing error!</DialogTitle>
            <DialogContent>
              <DialogContentText>{typeof error === 'string' ? error : 'An unknown error occured while trying to execute this script. Please head to the server console to obtain more informations.'}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.closeDialog}
                disabled={loading}
              >
                Close
              </Button>
            </DialogActions>
          </Fragment>

        ) : (
          <Fragment>
            <DialogTitle>Execute Script in Background?</DialogTitle>
            <DialogContent>
              <DialogContentText> Do you want to execute the script in the background or should we just jump right into it? </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.startTask()}
                disabled={loading}
              >
                Start in Background
              </Button>
              <Button
                color='primary'
                onClick={this.startTask(true)}
                disabled={loading}
              >
                Start in Foreground
              </Button>
            </DialogActions>
          </Fragment>
        )}
      </Dialog>
    )
  }
}
