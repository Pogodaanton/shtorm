import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Typography
} from '@material-ui/core'
import AssignmentDoneIcon from '@material-ui/icons/AssignmentTurnedIn'
import InputIcon from '@material-ui/icons/Input'
import ClearIcon from '@material-ui/icons/Clear'
import { SocketContext } from '../../contexts/SocketContext'
import './TasksPopover.scss'

export default class TasksPopover extends PureComponent {
  static contextType = SocketContext
  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any.isRequired,
    requestClose: PropTypes.func.isRequired
  }

  state = {
    tasks: null
  }

  componentDidMount = () => this.requestTasks()

  componentDidUpdate = (prevProps) => {
    if (prevProps.open !== this.props.open) this.requestTasks()
  }

  requestTasks = () => {
    if (this.props.open) {
      this.context.socket.on('tasks.update', this.updateTasks)
      this.context.socket.emit('tasks.request')
    } else {
      this.context.socket.emit('tasks.request.stop')
      this.context.socket.off('tasks.update', this.updateTasks)
    }
  }

  updateTasks = (tasks) => {
    console.log(tasks)
    this.setState({ tasks })
  }

  killTask = (uuid) => () => {
    this.context.socket.emit('task.kill', uuid)
  }

  render () {
    const { open, anchor, requestClose } = this.props
    const { tasks } = this.state
    return (
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={requestClose}
        className='popover-tasks'
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {tasks ? tasks.length === 0 ? (
          <Typography variant='caption'>There are no processes running currently.</Typography>
        ) : tasks.map(({ uuid, scriptName, progress, finished }) => (
          <List
            dense
            key={uuid}
          >
            <ListItem className='popover-tasks-list'>
              <ListItemIcon>
                {!finished ? (
                  <CircularProgress
                    size={25}
                    variant={progress > 0 ? 'determinate' : 'indeterminate'}
                    value={progress}
                  />
                ) : <AssignmentDoneIcon /> }
              </ListItemIcon>
              <ListItemText
                primary={`Process ID: ${uuid}`}
                secondary={`Script: ${scriptName}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={this.killTask(uuid)}
                  aria-label='Kill Process'
                >
                  <ClearIcon />
                </IconButton>
                <IconButton
                  component={Link}
                  to={`/task/${encodeURIComponent(uuid)}`}
                  aria-label='Open Process'
                >
                  <InputIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        )) : (
          <Typography variant='subtitle1'>Requesting running processes...</Typography>
        )}
      </Popover>
    )
  }
}
