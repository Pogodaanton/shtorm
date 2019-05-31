import React, { Component } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@material-ui/core'
import ActivatingListItem from '../ActivatingListItem'
import { Add, AccountCircle } from '@material-ui/icons'
import PropTypes from 'prop-types'

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
