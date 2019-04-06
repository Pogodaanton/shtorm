import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { AppBar, Typography, Toolbar, Button } from '@material-ui/core'

export default class index extends Component {
  render () {
    return (
      <AppBar
        id='page-header'
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
          <Button color='inherit'>
            Edit Config
          </Button>
        </Toolbar>
      </AppBar>
    )
  }
}
