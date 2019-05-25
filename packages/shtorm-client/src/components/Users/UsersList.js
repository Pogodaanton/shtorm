import React, { Component } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import PropTypes from 'prop-types'

export default class UsersList extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired
  }

  render () {
    const { loading } = this.props
    return (
      <List>
        <ListItem
          button
          key={'add'}
          onClick={this.onAddClick}
          disabled={loading}
        >
          <ListItemIcon><Add /></ListItemIcon>
          <ListItemText primary={'Add User'} />
        </ListItem>
        <Divider />
        {loading && (
          <ListItem key={'loading'} >
            <ListItemIcon><CircularProgress size={22} /></ListItemIcon>
            <ListItemText primary={'Requesting all users...'} />
          </ListItem>
        )}
      </List>
    )
  }
}
