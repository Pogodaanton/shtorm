import React from 'react'
import { MuiThemeProvider, withStyles } from '@material-ui/core'
import { theme } from '../../themes/dark'
import { SnackbarProvider } from 'notistack'
import PropTypes from 'prop-types'
import SocketContextProvider from '../../contexts/SocketContext'
import UserContextProvider from '../../contexts/UserContext'
import Loadable from 'react-loadable'
import FullscreenSpinner from '../Spinners/FullscreenLoadable'
import './App.scss'

const styles = {
  success: { color: 'white' },
  error: { color: 'white' },
  info: { color: 'white' }
}

const AppContent = Loadable({
  loader: () => import('./AppContent'),
  loading: FullscreenSpinner
})

function App ({ classes }) {
  return (
    <SocketContextProvider>
      <MuiThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={4}
          classes={{
            variantSuccess: classes.success,
            variantError: classes.error,
            variantInfo: classes.info
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          autoHideDuration={3000}
        >
          <UserContextProvider>
            <AppContent />
          </UserContextProvider>
        </SnackbarProvider>
      </MuiThemeProvider>
    </SocketContextProvider>
  )
}

App.propTypes = {
  classes: PropTypes.any.isRequired
}

export default withStyles(styles)(App)
