import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { MuiThemeProvider, withStyles } from '@material-ui/core'
import { theme } from '../../themes/dark'
import { SnackbarProvider } from 'notistack'
import PropTypes from 'prop-types'
import TerminalContextProvider from '../../contexts/TerminalContext'
import SocketContextProvider from '../../contexts/SocketContext'
import DefaultGridContainer from '../DefaultGridContainer'
import Header from '../Header'
import Home from '../Home'
import Task from '../Task'
import NotFound from '../NotFound'
import Terminal from '../Terminal'
import BotConfigs from '../BotConfigs'
import Users from '../Users'
import './App.scss'

const styles = {
  success: { color: 'white' },
  error: { color: 'white' },
  info: { color: 'white' }
}

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
        >
          <Header />
          <div className='content content-flex'>
            <DefaultGridContainer name='main'>
              <Switch>
                <Route
                  exact
                  path='/'
                  component={Home}
                />
                <Route
                  path='/add'
                  component={Home}
                />
                <Route
                  path='/edit/:name'
                  component={Home}
                />
                <Route
                  path='/delete/:name'
                  component={Home}
                />
                <Route
                  path='/start/:name'
                  component={Home}
                />
                <Route
                  path='/task/:uuid'
                  component={Task}
                />
                <Route
                  path='/users'
                  component={Users}
                  exact
                />
                <Route
                  path='/configs'
                  component={BotConfigs}
                  exact
                />
                <Route
                  path='/configs/:name'
                  component={BotConfigs}
                />
                <Route
                  path='/'
                  component={NotFound}
                />
              </Switch>
            </DefaultGridContainer>
            <TerminalContextProvider>
              <Terminal />
            </TerminalContextProvider>
          </div>
        </SnackbarProvider>
      </MuiThemeProvider>
    </SocketContextProvider>
  )
}

App.propTypes = {
  classes: PropTypes.any.isRequired
}

export default withStyles(styles)(App)
