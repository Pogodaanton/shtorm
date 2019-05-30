import React from 'react'
import config from '../../config.json'
import { Button } from '@material-ui/core'

class Api {
  axiosCheckResponse (res) {
    if (typeof res !== 'undefined' && typeof res.data !== 'undefined' && typeof res.data.data !== 'undefined') return true
    return false
  }

  axiosErrorHandler (err, enqueueSnackbar, closeSnackbar) {
    let errMsg = err.toString()
    if (typeof err.response !== 'undefined' && typeof err.response.data !== 'undefined') {
      if (typeof err.response.data.message === 'string') errMsg = err.response.data.message
      if (typeof err.response.data.errors === 'object') errMsg = err.response.data.errors.map(({ msg }) => msg).join('\n')
    }

    console.log(errMsg)

    if (typeof enqueueSnackbar === 'function') {
      const isSnackbarDismissable = (typeof closeSnackbar === 'function')
      enqueueSnackbar(errMsg, {
        variant: 'error',
        autoHideDuration: isSnackbarDismissable ? null : 6000,
        persist: isSnackbarDismissable,
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
  }

  axiosErrorHandlerNotify = (enqueueSnackbar, closeSnackbar) => (err) => this.axiosErrorHandler(err, enqueueSnackbar, closeSnackbar)

  getApiUrl (controller) {
    return `${config.prefix}${config.socketAdress}${config.apiAdress}${controller}`
  }
}

export default new Api()
