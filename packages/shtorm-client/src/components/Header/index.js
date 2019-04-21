import React, { Component } from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import { AppBar, Typography, Toolbar, IconButton, Tooltip } from '@material-ui/core'
import { Build, Home, Assignment } from '@material-ui/icons'
import TasksPopover from '../TasksPopover'
import './Header.scss'

export default class index extends Component {
  state = {
    tasksOpen: false
  }

  toggleTasks = (e) => this.setState({ tasksOpen: !this.state.tasksOpen })

  iconButtonRef = null
  setIconButtonRef = (r) => { this.iconButtonRef = r }

  render () {
    const { tasksOpen } = this.state
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
          >Shtorm ⛈ |&nbsp;
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
          <div
            id='toggleTasks'
            ref={this.setIconButtonRef}
          >
            <Tooltip title='Show running tasks'>
              <IconButton onClick={this.toggleTasks} >
                <Assignment />
              </IconButton>
            </Tooltip>
          </div>
          <Switch>
            <Route
              path='/'
              exact
              component={() => (
                <Tooltip title='Edit bot configs'>
                  <IconButton
                    component={Link}
                    to='/configs'
                  >
                    <Build />
                  </IconButton>
                </Tooltip>
              )}
            />
            <Route
              path='/'
              component={() => (
                <Tooltip title='Go back to the Dashboard'>
                  <IconButton
                    component={Link}
                    to='/'
                  >
                    <Home />
                  </IconButton>
                </Tooltip>
              )}
            />
          </Switch>
        </Toolbar>
        {this.iconButtonRef && <TasksPopover
          open={tasksOpen}
          anchor={this.iconButtonRef}
          requestClose={this.toggleTasks}
        />}
      </AppBar>
    )
  }
}
