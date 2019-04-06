import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { MuiThemeProvider, Grid } from '@material-ui/core'
import { theme } from '../../themes/dark'
import Header from '../Header'
import Home from '../Home'
import NotFound from '../NotFound'
import Terminal from '../Terminal'
import './App.scss'

// const App = () => <div>Hello World!</div>
export default class index extends Component {
  render () {
    return (
      <MuiThemeProvider theme={theme}>
        <Header />
        <Grid
          container
          className='content'
        >
          <Switch>
            <Route
              exact
              path='/'
              component={Home}
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
