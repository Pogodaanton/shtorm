import React, { Component, Fragment } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Slide } from '@material-ui/core'
import AcceptIcon from '@material-ui/icons/ThumbUp'
import RejectIcon from '@material-ui/icons/ThumbDown'
import MinimizeIcon from '@material-ui/icons/ExpandMore'
import SubmitIcon from '@material-ui/icons/Send'
import PropTypes from 'prop-types'
import { Editor, EditorDiff } from './TaskDialogEditor'

const SlideTransition = React.forwardRef(function Transition (props, ref) {
  return <Slide
    direction='up'
    ref={ref}
    {...props}
  />
})

export default class TaskDialog extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    dialog: PropTypes.object.isRequired,
    socket: PropTypes.any.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleHide: PropTypes.func.isRequired
  }

  code = ''
  state = {
    loading: false
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.dialog !== this.props.dialog) {
      const { dialog } = this.props
      if (typeof dialog !== 'object') this.rejectWithError(new Error('The dialog data needs to be of type "Object" with at least the key "type" of type "String".'))
      else if (dialog.type === 'prompt' && typeof dialog.msg !== 'string') this.rejectWithError(new Error('The dialog type "prompt" needs the key "msg" of type "String".'))
      else if (dialog.type === 'diff' && (typeof dialog.code !== 'string' || typeof dialog.diffCode !== 'string')) this.rejectWithError(new Error('The dialog type "diff" needs the keys "code" and "diffCode", both are of type "String".'))
      else if (dialog.type === 'code' && (typeof dialog.code !== 'string' || typeof dialog.msg !== 'string')) this.rejectWithError(new Error('The dialog type "code" needs the keys "code" and "msg", both are of type "String".'))
    }
  }

  rejectWithError = (err) => {
    this.props.socket.emit('script.dialog.reject', err)
    this.props.handleClose()
  }

  rejectPromptDialog = () => {
    this.props.socket.emit('script.dialog.resolve', false)
    this.props.handleClose()
  }

  resolvePromptDialog = () => {
    this.props.socket.emit('script.dialog.resolve', true)
    this.props.handleClose()
  }

  rejectDiffDialog = () => {
    this.props.socket.emit('script.dialog.resolve', false)
    this.props.handleClose()
  }

  resolveMonacoDialog = () => {
    this.props.socket.emit('script.dialog.resolve', this.code)
    this.props.handleClose()
  }

  handleMonacoChange = (newCode) => { this.code = newCode }

  render () {
    const { dialog, open, handleHide } = this.props
    const { loading } = this.state

    if (dialog.type === 'prompt') {
      if (typeof dialog.msg !== 'string') return null
      return (
        <Dialog
          open={open}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Fragment>
            <DialogTitle>Your script has something to say!</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialog.msg}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.rejectPromptDialog}
                disabled={loading}
              >
              Cancel
              </Button>
              <Button
                color='primary'
                onClick={this.resolvePromptDialog}
                disabled={loading}
              >
              OK
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      )
    }

    if (dialog.type === 'diff') {
      return (
        <Dialog
          open={open}
          TransitionComponent={SlideTransition}
          fullScreen
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Fragment>
            <DialogTitle>Check your changes!</DialogTitle>
            <DialogContent>
              <EditorDiff
                language={dialog.language || 'xml'}
                code={dialog.code}
                diffCode={dialog.diffCode}
                onChange={this.handleMonacoChange}
              />
            </DialogContent>
            <DialogActions className='task-dialog-actions'>
              <Button
                onClick={handleHide}
                disabled={loading}
              >
                <MinimizeIcon />
                Hide Dialog
              </Button>
              <Button
                color='primary'
                variant='outlined'
                onClick={this.rejectDiffDialog}
                disabled={loading}
              >
                <RejectIcon />
                Reject Changes
              </Button>
              <Button
                color='secondary'
                variant='contained'
                onClick={this.resolveMonacoDialog}
                disabled={loading}
              >
                <AcceptIcon />
                Accept Changes
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      )
    }

    if (dialog.type === 'code') {
      return (
        <Dialog
          open={open}
          TransitionComponent={SlideTransition}
          fullScreen
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Fragment>
            <DialogTitle>{dialog.msg}</DialogTitle>
            <DialogContent>
              <Editor
                language={dialog.language || 'xml'}
                code={dialog.code}
                onChange={this.handleMonacoChange}
              />
            </DialogContent>
            <DialogActions className='task-dialog-actions'>
              <Button
                onClick={handleHide}
                disabled={loading}
              >
                <MinimizeIcon />
                Hide Dialog
              </Button>
              <Button
                color='primary'
                variant='outlined'
                onClick={this.resolveMonacoDialog}
                disabled={loading}
              >
                <SubmitIcon />
                Submit
              </Button>
            </DialogActions>
          </Fragment>
        </Dialog>
      )
    }

    return null
  }
}
