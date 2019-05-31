import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import { AppBar, Button, Toolbar, IconButton, Tooltip } from '@material-ui/core'
import { Build, Home, Assignment, SupervisorAccount, ExitToApp } from '@material-ui/icons'
import PropTypes from 'prop-types'
import TasksPopover from '../TasksPopover'
import './Header.scss'

function ActivatingLinkButton ({ children, to, activeOnlyWhenExact }) {
  return (
    <Route
      path={to}
      exact={activeOnlyWhenExact}
    >
      {({ match }) => (
        <Button
          size='small'
          className={match ? 'active' : ''}
          component={Link}
          to={to}
        >{children}</Button>
      )}
    </Route>
  )
}

ActivatingLinkButton.propTypes = {
  children: PropTypes.any,
  to: PropTypes.string,
  activeOnlyWhenExact: PropTypes.bool
}

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
        <Toolbar variant='dense'>
          <span className='page-header-logo'>⛈</span>
          <ActivatingLinkButton
            to='/'
            activeOnlyWhenExact
          >
            <Home />
            <span>Dashboard</span>
          </ActivatingLinkButton>
          <ActivatingLinkButton to='/configs' >
            <Build />
            <span>Bot configs</span>
          </ActivatingLinkButton>
          <ActivatingLinkButton to='/users' >
            <SupervisorAccount />
            <span>Users</span>
          </ActivatingLinkButton>
          <div className='fill-space' />
          <div
            id='toggleTasks'
            ref={this.setIconButtonRef}
          >
            <Tooltip title='Show running processes'>
              <IconButton onClick={this.toggleTasks} >
                <Assignment />
              </IconButton>
            </Tooltip>
            <Tooltip title='Log out'>
              <IconButton
                component={Link}
                to={'/logout'}
              >
                <ExitToApp />
              </IconButton>
            </Tooltip>
          </div>
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
