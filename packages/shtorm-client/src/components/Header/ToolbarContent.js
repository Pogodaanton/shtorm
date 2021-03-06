import React, { Component, Fragment } from 'react'
import { Route, Link } from 'react-router-dom'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Build, Home, Assignment, SupervisorAccount, AccountCircle } from '@material-ui/icons'
import { UserContext } from '../../contexts/UserContext'
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
  static contextType = UserContext
  static propTypes = {
    onProcessExplorerButtonRef: PropTypes.func.isRequired,
    onProcessExplorerToggle: PropTypes.func.isRequired,
    onProfileButtonRef: PropTypes.func.isRequired,
    onProfileToggle: PropTypes.func.isRequired
  }

  render () {
    const { isAdmin, createConfigs } = (this.context.currentUser.permissions || this.context.currentUser)
    return (
      <Fragment>
        <ActivatingLinkButton
          to='/'
          activeOnlyWhenExact
        >
          <Home />
          <span>Dashboard</span>
        </ActivatingLinkButton>
        {(isAdmin || createConfigs) && (
          <ActivatingLinkButton to='/configs' >
            <Build />
            <span>Bot configs</span>
          </ActivatingLinkButton>
        )}
        {isAdmin && (
          <ActivatingLinkButton to='/users' >
            <SupervisorAccount />
            <span>Users</span>
          </ActivatingLinkButton>
        )}
        <div className='flex-fill' />
        <div className='right-space'>
          {this.context.getUserPermission('isAdmin') && (
            <div
              id='toggleTasks'
              ref={this.props.onProcessExplorerButtonRef}
            >
              <Tooltip title='Show running processes'>
                <IconButton onClick={this.props.onProcessExplorerToggle} >
                  <Assignment />
                </IconButton>
              </Tooltip>
            </div>
          )}
          <div
            id='toggleProfile'
            ref={this.props.onProfileButtonRef}
          >
            <Tooltip title='User profile'>
              <IconButton onClick={this.props.onProfileToggle} >
                <AccountCircle />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </Fragment>
    )
  }
}
