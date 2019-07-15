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
import './ProcessExplorer.scss'

export default class ProcessExplorer extends PureComponent {
  static contextType = SocketContext
  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any.isRequired,
    requestClose: PropTypes.func.isRequired
  }

  state = {
    processes: null
  }

  componentDidMount = () => this.requestProcesses()
  componentDidUpdate = (prevProps) => {
    if (prevProps.open !== this.props.open) this.requestProcesses()
  }

  requestProcesses = () => {
    if (this.props.open) {
      this.context.socket.on('processes.update', this.updateProcesses)
      this.context.socket.emit('processes.request')
    } else {
      this.context.socket.emit('processes.request.stop')
      this.context.socket.off('processes.update', this.updateProcesses)
    }
  }

  updateProcesses = (processes) => {
    this.setState({ processes })
  }

  killTask = (pid) => () => {
    this.context.socket.emit('process.kill', pid)
  }

  render () {
    const { open, anchor, requestClose } = this.props
    const { processes } = this.state
    return (
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={requestClose}
        className='popover-process-explorer'
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {processes ? processes.length === 0 ? (
          <Typography variant='caption'>There are no processes running currently.</Typography>
        ) : (
          <List dense>
            {processes.map(({ pid, scriptName, progress, finished }) => (
              <ListItem
                className='popover-process-explorer-list'
                key={pid}
              >
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
                  primary={`Process ID: ${pid}`}
                  secondary={`Script: ${scriptName}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={this.killTask(pid)}
                    aria-label='Kill Process'
                  >
                    <ClearIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/p/${encodeURIComponent(pid)}`}
                    aria-label='Open Process'
                  >
                    <InputIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant='caption'>Requesting running processes...</Typography>
        )}
      </Popover>
    )
  }
}
