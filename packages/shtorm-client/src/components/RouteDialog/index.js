import React, { Component } from 'react'
import { Dialog } from '@material-ui/core'
import PropTypes from 'prop-types'

export default class RouteDialog extends Component {
  static propTypes = {
    open: PropTypes.bool,
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

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.open !== this.props.open &&
      typeof this.props.open === 'boolean' &&
      !this.props.open
    ) {
      this.closeDialog()
    }
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
