import React, { Component } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress } from '@material-ui/core'
import { Add, Dns } from '@material-ui/icons'
import ActivatingListItem from '../ActivatingListItem'
import PropTypes from 'prop-types'

export default class BotConfigList extends Component {
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
          to='/configs/add'
          disabled={loading}
        >
          <ListItemIcon><Add /></ListItemIcon>
          <ListItemText primary={'Add Config'} />
        </ActivatingListItem>
        <Divider />
        {loading ? (
          <ListItem key={'loading'} >
            <ListItemIcon><CircularProgress size={22} /></ListItemIcon>
            <ListItemText primary={'Requesting Configs...'} />
          </ListItem>
        ) : list.map(({ name, id }, i) => (
          <ActivatingListItem
            key={name}
            to={`/configs/${id}`}
          >
            <ListItemIcon><Dns /></ListItemIcon>
            <ListItemText
              primary={name}
            />
          </ActivatingListItem>
        ))}
      </List>
    )
  }
}
