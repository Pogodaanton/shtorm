import React, { Component } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@material-ui/core'
import { Route, Link } from 'react-router-dom'
import { Add, AccountCircle } from '@material-ui/icons'
import PropTypes from 'prop-types'

function ActivatingListItem ({ children, to, activeOnlyWhenExact, disabled }) {
  return (
    <Route
      path={to}
      exact={activeOnlyWhenExact}
    >
      {({ match }) => (
        <ListItem
          button
          selected={match && true}
          component={Link}
          to={to}
          disabled={disabled}
        >
          {children}
        </ListItem>
      )}
    </Route>
  )
}

ActivatingListItem.propTypes = {
  children: PropTypes.any,
  to: PropTypes.string,
  activeOnlyWhenExact: PropTypes.bool,
  disabled: PropTypes.bool
}

export default class UsersList extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    list: PropTypes.array.isRequired
  }

  render () {
    const { loading, list } = this.props
    return (
      <List>
        <ActivatingListItem
          key={'add'}
          to='/users/add'
          disabled={loading}
        >
          <ListItemIcon><Add /></ListItemIcon>
          <ListItemText primary={'Add User'} />
        </ActivatingListItem>
        <Divider />
        {loading ? (
          <ListItem key={'loading'} >
            <ListItemIcon><CircularProgress size={22} /></ListItemIcon>
            <ListItemText primary={'Requesting Users...'} />
          </ListItem>
        ) : list.map(({ username, id, isAdmin, lastSeen }, i) => (
          <ActivatingListItem
            key={id}
            to={`/users/${id}`}
          >
            <ListItemIcon><AccountCircle /></ListItemIcon>
            <ListItemText
              primary={username}
              secondary={`${isAdmin ? '👑 • ' : ''} Last Seen: ${lastSeen ? new Date(lastSeen).getDate : 'Never'}`}
            />
          </ActivatingListItem>
        ))}
      </List>
    )
  }
}
