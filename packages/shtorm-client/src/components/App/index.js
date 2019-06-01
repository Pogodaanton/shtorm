import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { MuiThemeProvider, withStyles } from '@material-ui/core'
import { theme } from '../../themes/dark'
import { SnackbarProvider } from 'notistack'
import PropTypes from 'prop-types'
import SocketContextProvider from '../../contexts/SocketContext'
import Loader, { ContextLoader } from '../Loader'
import './App.scss'

const styles = {
  success: { color: 'white' },
  error: { color: 'white' },
  info: { color: 'white' }
}

const Home = Loader('Home')
const Task = Loader('Task')
const NotFound = Loader('NotFound')
const Login = Loader('Login')
const Logout = Loader('Logout')
const Terminal = Loader('Terminal')
const BotConfigs = Loader('BotConfigs')
const Users = Loader('Users')
const Header = Loader('Header')
const DefaultGridContainer = Loader('DefaultGridContainer')
const TerminalContextProvider = ContextLoader('TerminalContext', () => null)

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
          <Switch>
            <Route
              path='/login'
              component={Login}
            />
            <Route path='/'>
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
                    />
                    <Route
                      path='/configs'
                      component={BotConfigs}
                    />
                    <Route
                      path='/logout'
                      component={Logout}
                    />
                    <Route
                      path='/'
                      component={NotFound}
                    />
                  </Switch>
                </DefaultGridContainer>
                <TerminalContextProvider>
                  <Switch>
                    <Route
                      path='/configs'
                      component={() => null}
                    />
                    <Route
                      path='/users'
                      component={() => null}
                    />
                    <Route
                      path='/login'
                      component={() => null}
                    />
                    <Route
                      path='/logout'
                      component={() => null}
                    />
                    <Route
                      path='/'
                      component={Terminal}
                    />
                  </Switch>
                </TerminalContextProvider>
              </div>
            </Route>
          </Switch>
        </SnackbarProvider>
      </MuiThemeProvider>
    </SocketContextProvider>
  )
}

App.propTypes = {
  classes: PropTypes.any.isRequired
}

export default withStyles(styles)(App)
