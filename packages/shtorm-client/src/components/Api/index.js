import React, { Component } from 'react'
import { Button } from '@material-ui/core'
import { ConfigContext } from '../../contexts/ConfigContext'
import { withSnackbar } from 'notistack'
import PropTypes from 'prop-types'

class Api extends Component {
  static contextType = ConfigContext
  static propTypes = {
    children: PropTypes.func.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
    closeSnackbar: PropTypes.func.isRequired
  }

  axiosCheckResponse = (res) => {
    if (typeof res !== 'undefined' && typeof res.data !== 'undefined' && typeof res.data.data !== 'undefined') return true
    return false
  }

  baseAxiosErrorHandler = (err = new Error('An unexpected error happened!'), isSnackbarDismissable, history, fallbackPath) => {
    let errMsg = err.toString()
    let isAuthError = false
    if (typeof err.response !== 'undefined' && typeof err.response.data !== 'undefined') {
      if (typeof err.response.data.message === 'string') errMsg = err.response.data.message
      if (typeof err.response.data.errors === 'object') {
        err.response.data.errors.forEach(({ param }) => { if (param === 'permission') isAuthError = true })
        errMsg = err.response.data.errors.map(({ msg }) => msg).join('\n')
      }
    }

    if (errMsg === '[object Object]') {
      if (typeof err.stack === 'string') errMsg = err.stack
      else errMsg = JSON.stringify(err)
    }

    console.log(errMsg)
    const { enqueueSnackbar, closeSnackbar } = this.props

    enqueueSnackbar(errMsg, {
      variant: 'error',
      autoHideDuration: isSnackbarDismissable ? 20000 : 6000,
      action: isSnackbarDismissable ? (key) => (
        <Button
          variant='outlined'
          onClick={() => { closeSnackbar(key) }}
        >
          Dismiss
        </Button>
      ) : null
    })

    if (typeof history === 'object' && typeof history.replace === 'function') {
      if (isAuthError) history.replace('/login')
      else if (typeof fallbackPath === 'string') history.replace(fallbackPath)
    }
  }

  axiosErrorHandler = (isSnackbarDismissable = false, history = {}, fallbackPath = '/') => (err) => this.baseAxiosErrorHandler(err, isSnackbarDismissable, history, fallbackPath)

  getApiUrl = (controller) => {
    return `${this.context.prefix}${this.context.socketAdress}${this.context.apiAdress}${controller}`
  }

  render () {
    const {
      axiosCheckResponse,
      axiosErrorHandler,
      getApiUrl
    } = this

    return this.props.children({
      axiosCheckResponse,
      axiosErrorHandler,
      getApiUrl
    })
  }
}

const ApiWithSnackbar = withSnackbar(Api)
export default ApiWithSnackbar

export const withApi = (Component) => {
  return function ConnectedComponent (props) {
    return (
      <ApiWithSnackbar>
        {(Api) => (
          <Component
            {...props}
            api={Api}
          />
        )}
      </ApiWithSnackbar>
    )
  }
}
