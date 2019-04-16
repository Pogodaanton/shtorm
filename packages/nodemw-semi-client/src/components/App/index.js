import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core'
import { theme } from '../../themes/dark'
import TerminalContextProvider from '../../contexts/TerminalContext'
import SocketContextProvider from '../../contexts/SocketContext'
import DefaultGridContainer from '../DefaultGridContainer'
import Header from '../Header'
import Home from '../Home'
import Start from '../Start'
import NotFound from '../NotFound'
import Terminal from '../Terminal'
import BotConfigs from '../BotConfigs'
import './App.scss'

class App extends Component {
  render () {
    return (
      <SocketContextProvider>
        <MuiThemeProvider theme={theme}>
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
                  component={Start}
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
        </MuiThemeProvider>
      </SocketContextProvider>
    )
  }
}

export default withRouter(App)
