import React, { Component, Fragment } from 'react'
import { Route, Link } from 'react-router-dom'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Build, Home, Assignment, SupervisorAccount, ExitToApp } from '@material-ui/icons'
import PropTypes from 'prop-types'

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

export default class ToolbarContent extends Component {
  static propTypes = {
    onIconButtonRef: PropTypes.func.isRequired,
    onTaskToggle: PropTypes.func.isRequired
  }

  render () {
    return (
      <Fragment>
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
        <div className='right-space'>
          <div
            id='toggleTasks'
            ref={this.props.onIconButtonRef}
          >
            <Tooltip title='Show running processes'>
              <IconButton onClick={this.props.onTaskToggle} >
                <Assignment />
              </IconButton>
            </Tooltip>
          </div>
          <Tooltip title='Log out'>
            <IconButton
              component={Link}
              to={'/logout'}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </div>
      </Fragment>
    )
  }
}
