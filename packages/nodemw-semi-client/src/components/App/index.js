import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { MuiThemeProvider, Grid } from '@material-ui/core'
import { theme } from '../../themes/dark'
import Header from '../Header'
import Home from '../Home'
import NotFound from '../NotFound'
import Terminal from '../Terminal'
import BotConfigs from '../BotConfigs'
import './App.scss'

// const App = () => <div>Hello World!</div>
class App extends Component {
  render () {
    console.log(this.props)

    return (
      <MuiThemeProvider theme={theme}>
        <Header />
        <Grid
          container
          className='content'
          justify='center'
          alignContent='stretch'
          spacing={16}
        >
          <Switch>
            <Route
              exact
              path='/'
              component={Home}
            />
            <Route
              path='/configs'
              component={BotConfigs}
              exact
            />
            <Route
              path='/configs/:id'
              component={BotConfigs}
            />
            <Route
              path='/'
              component={NotFound}
            />
          </Switch>
          <Terminal />
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(App)
