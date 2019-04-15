import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { AppBar, Typography, Toolbar } from '@material-ui/core'
import { Build, Home } from '@material-ui/icons'
import HeaderLink from './HeaderLink'
import './Header.scss'

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
                path='/add'
                component={() => 'Add Preset'}
              />
              <Route
                path='/edit'
                component={() => 'Edit Preset'}
              />
              <Route
                path='/delete'
                component={() => 'Delete Preset'}
              />
              <Route
                path='/configs'
                component={() => 'Bot configs'}
              />
              <Route
                path='/'
                component={() => '404: Not found'}
              />
            </Switch>
          </Typography>
          <div className='fill-space' />
          <Switch>
            <Route
              path='/configs'
              component={() => <HeaderLink
                icon={Home}
                to='/'
                tooltip='Go back to Dashboard'
              />}
            />
            <Route
              path='/'
              component={() => <HeaderLink
                icon={Build}
                to='/configs'
                tooltip='Edit bot configs'
              />}
            />
          </Switch>
        </Toolbar>
      </AppBar>
    )
  }
}
