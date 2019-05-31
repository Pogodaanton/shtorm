import React, { Fragment } from 'react'
import { Dialog, DialogContent, DialogContentText, CircularProgress, Button } from '@material-ui/core'
import PropTypes from 'prop-types'
import './Fullscreen.scss'

const FullscreenLoadable = ({ error, timedOut, pastDelay, retry }) => {
  if (error) console.log(error)
  return (
    <Fragment>
      {!error && <div className='anti-pointer' />}
      <Dialog
        open={!!((error || timedOut || pastDelay))}
        disableBackdropClick
        aria-describedby='spinner-fullscreen-description'
        className='spinner spinner-fullscreen'
      >
        <DialogContent className='spinner-content'>
          {!error && (
            <CircularProgress
              color='primary'
              className='spinner-progress'
            />
          )}
          <DialogContentText id='spinner-fullscreen-description'>
            {error ? (
              <Fragment>
                An unexpected error happened, see console for more information!
                <Button onClick={retry}>Retry</Button>
              </Fragment>
            ) : 'Loading the unloadable...'}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

FullscreenLoadable.propTypes = {
  error: PropTypes.any,
  timedOut: PropTypes.any,
  pastDelay: PropTypes.any,
  retry: PropTypes.any
}

export { FullscreenLoadable as default }
