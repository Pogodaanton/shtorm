import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Paper } from '@material-ui/core'
import SpotlightLinear from '../Spinners/SpotlightLinear'
import DefaultGridItem from '../DefaultGridItem'
import { SocketContext } from '../../contexts/SocketContext/index'

export default class Start extends Component {
  static contextType = SocketContext
  static propTypes = {
    match: PropTypes.object.isRequired
  }

  uuid = null
  scriptName = decodeURIComponent(this.props.match.params.name)
  state = {
    progress: 0
  }

  componentWillUnmount = () => {
    this.context.socket.emit('stop', this.scriptName)
    this.context.socket.off('prompt', this.openPrompt)
    this.context.socket.off('start.success', this.saveUUID)
  }

  componentDidMount = () => {
    this.context.socket.emit('start', this.scriptName)
    this.context.socket.on('start.success', this.saveUUID)
    this.context.socket.on('script.progress', this.progress)
    this.context.socket.on('prompt', this.openPrompt)
  }

  saveUUID = (uuid) => {
    console.log(uuid)
    this.uuid = uuid
  }

  progress = (progress) => {
    console.log(progress)
    this.setState({ progress })
  }

  openPrompt = (e) => {
    console.log(e)
  }

  render () {
    const { progress } = this.state
    return (
      <DefaultGridItem name='not-found'>
        <Paper className='paper'>
          <Prompt
            when
            message='If you leave this page, you could potentially break the functionality of your running script! Are you willing to take this risk!'
          />
          <SpotlightLinear value={progress} />
        </Paper>
      </DefaultGridItem>
    )
  }
}
