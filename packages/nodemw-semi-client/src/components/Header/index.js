import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'

export default class index extends Component {
  render () {
    return (
      <AppBar
        position='static'
        color='primary'
      >
        <Toolbar>
          <Typography
            variant='h6'
            color='inherit'
            className='main-header'
          >Nodemw-Semi |&nbsp;
            <Switch>
              <Route
                exact
                path='/'
                component={() => 'Dashboard'}
              />
              <Route
                path='/'
                component={() => '404: Not found'}
              />
            </Switch>
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }
}
