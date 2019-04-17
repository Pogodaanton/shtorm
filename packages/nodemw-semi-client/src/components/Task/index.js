import React, { Component } from 'react'
import { Prompt, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Paper, Typography, Button } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import SpotlightLinear from '../Spinners/SpotlightLinear'
import DefaultGridItem from '../DefaultGridItem'
import { SocketContext } from '../../contexts/SocketContext'
import './Task.scss'

export default class Start extends Component {
  static contextType = SocketContext
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  uuid = null
  state = {
    progress: 0,
    progressText: null,
    connecting: true,
    error: null,
    finished: false
  }

  componentWillUnmount = () => {
    this.context.socket.off('task.request.success', this.handleSuccess)
    this.context.socket.off('task.request.error', this.handleError)
    this.context.socket.off('script.progress', this.updateProgress)
    this.context.socket.off('script.success', this.handleScriptSuccess)
  }

  componentDidMount = () => {
    this.uuid = decodeURIComponent(this.props.match.params.uuid)
    this.context.socket.on('task.request.success', this.handleSuccess)
    this.context.socket.on('task.request.error', this.handleError)
    this.context.socket.on('script.progress', this.updateProgress)

    this.context.socket.emit('task.request', this.uuid)
  }

  handleSuccess = () => this.setState({ connecting: false })
  handleError = (error) => this.setState({ error })
  updateProgress = ({ progress, progressText, finished }) => this.setState({ progress, progressText, finished })

  render () {
    const { progress, connecting, error, finished, progressText } = this.state
    return (
      <DefaultGridItem name='task'>
        <Paper className='paper'>
          <Prompt
            when={!error && !finished}
            message='If you leave this page, you could potentially break the functionality of your running script! Are you willing to take this risk?'
          />
          {error ? (
            <div className='spotlight spotlight-task-error'>
              <Typography variant='h5' >{error}</Typography>
            </div>
          ) : finished ? (
            <div className='spotlight spotlight-task-success'>
              <Typography variant='h5' >Script successfully executed!</Typography>
              <Button
                color='primary'
                component={Link}
                to='/'
              ><HomeIcon />Go back to Dashboard</Button>
            </div>
          ) : (
            <SpotlightLinear
              value={progress}
              msg={connecting ? 'Connecting to Socket' : progressText || 'Please wait while the script is doing its thing.'}
            />
          )}
        </Paper>
      </DefaultGridItem>
    )
  }
}
