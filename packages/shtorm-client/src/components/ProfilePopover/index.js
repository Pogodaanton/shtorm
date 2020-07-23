import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Popover,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider
} from '@material-ui/core'
import { ExitToApp, AssignmentInd } from '@material-ui/icons'
import ActivatingListItem from '../ActivatingListItem'
import { UserContext } from '../../contexts/UserContext'
import './ProfilePopover.scss'

export default class TasksPopover extends PureComponent {
  static contextType = UserContext
  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any.isRequired,
    requestClose: PropTypes.func.isRequired
  }

  render () {
    const { open, anchor, requestClose } = this.props
    const { id, username } = this.context.currentUser
    return (
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={requestClose}
        className='popover-profile'
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <List dense>
          <Typography variant='subtitle2'>
            Hello, {username}
          </Typography>
          <Divider />
          <ActivatingListItem to={`/users/${id}`}>
            <ListItemIcon>
              <AssignmentInd />
            </ListItemIcon>
            <ListItemText primary='Edit Profile' />
          </ActivatingListItem>
          <ActivatingListItem to='/logout'>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary='Log out' />
          </ActivatingListItem>
        </List>
      </Popover>
    )
  }
}
