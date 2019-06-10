import React, { Component } from 'react'
import { Dialog } from '@material-ui/core'
import PropTypes from 'prop-types'

export default class RouteDialog extends Component {
  static propTypes = {
    origin: PropTypes.string,
    history: PropTypes.object.isRequired,
    children: PropTypes.any
  }

  timeOut = null
  state = {
    open: true
  }

  componentWillUnmount = () => {
    if (this.timeOut !== null) clearInterval(this.timeOut)
  }

  closeDialog = () => {
    this.setState({ open: false })
    this.timeOut = setTimeout(() => this.props.history.push(this.props.origin || '/'), 205)
  }

  render () {
    const { open } = this.state
    const { children } = this.props
    return (
      <Dialog
        open={open}
        onClose={this.closeDialog}
        {...this.props}
      >
        {children}
      </Dialog>
    )
  }
}
