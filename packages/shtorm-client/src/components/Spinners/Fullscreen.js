import React, { PureComponent, Fragment } from 'react'
import { Dialog, DialogContent, DialogContentText, CircularProgress } from '@material-ui/core'
import PropTypes from 'prop-types'
import './Fullscreen.scss'

export default class Fullscreen extends PureComponent {
  static propTypes = {
    msg: PropTypes.string
  }

  openTimeout = null
  state = {
    open: false
  }

  componentDidMount = () => {
    this.openTimeout = setTimeout(() => this.setState({ open: true }), 600)
  }

  componentWillUnmount = () => {
    clearTimeout(this.openTimeout)
  }

  render () {
    const { msg } = this.props
    return (
      <Fragment>
        <div className='anti-pointer' />
        <Dialog
          {...this.props}
          open={this.state.open}
          disableBackdropClick
          aria-describedby='spinner-fullscreen-description'
          className='spinner spinner-fullscreen'
        >
          <DialogContent className='spinner-content'>
            <CircularProgress
              color='primary'
              className='spinner-progress'
            />
            <DialogContentText id='spinner-fullscreen-description'>
              {msg || 'Loading the unloadable...'}
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </Fragment>
    )
  }
}
