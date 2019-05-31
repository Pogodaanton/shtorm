import React from 'react'
import config from '../../config.json'
import { Button } from '@material-ui/core'

class Api {
  axiosCheckResponse (res) {
    if (typeof res !== 'undefined' && typeof res.data !== 'undefined' && typeof res.data.data !== 'undefined') return true
    return false
  }

  axiosErrorHandler (err, enqueueSnackbar, closeSnackbar, history, fallbackPath) {
    let errMsg = err.toString()
    let isAuthError = false
    if (typeof err.response !== 'undefined' && typeof err.response.data !== 'undefined') {
      if (typeof err.response.data.message === 'string') errMsg = err.response.data.message
      if (typeof err.response.data.errors === 'object') {
        err.response.data.errors.forEach(({ param }) => { if (param === 'permission') isAuthError = true })
        errMsg = err.response.data.errors.map(({ msg }) => msg).join('\n')
      }
    }

    console.log(errMsg)

    if (typeof enqueueSnackbar === 'function') {
      const isSnackbarDismissable = (typeof closeSnackbar === 'function')
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
    }

    if (typeof history === 'object' && typeof history.replace === 'function') {
      if (isAuthError) history.replace('/login')
      else if (typeof fallbackPath === 'string') history.replace(fallbackPath)
    }
  }

  axiosErrorHandlerNotify = (enqueueSnackbar, closeSnackbar, history, fallbackPath) => (err) => this.axiosErrorHandler(err, enqueueSnackbar, closeSnackbar, history, fallbackPath)

  getApiUrl (controller) {
    return `${config.prefix}${config.socketAdress}${config.apiAdress}${controller}`
  }
}

export default new Api()
