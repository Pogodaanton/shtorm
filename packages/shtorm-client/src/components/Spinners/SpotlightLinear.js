import React, { PureComponent } from 'react'
import { Typography, LinearProgress } from '@material-ui/core'
import PropTypes from 'prop-types'
import './SpotlightLinear.scss'

export default class Fullscreen extends PureComponent {
  static propTypes = {
    value: PropTypes.number,
    msg: PropTypes.string,
    color: PropTypes.string
  }

  visibilityTimeout = null
  state = {
    visibility: false
  }

  componentDidMount = () => {
    this.visibilityTimeout = setTimeout(() => this.setState({ visibility: true }), 600)
  }

  componentWillUnmount = () => {
    clearTimeout(this.visibilityTimeout)
  }

  render () {
    const { value, color, msg } = this.props
    return this.state.visibility ? (
      <div className='spotlight spinner spinner-spotlight-linear'>
        <Typography
          variant='h5'
          className='spinner-text'
        >{msg || 'Loading the unloadable!'}</Typography>
        <LinearProgress
          color={color || 'primary'}
          className='spinner-progress'
          variant={value ? 'buffer' : 'query'}
          value={value}
          valueBuffer={0}
        />
      </div>
    ) : null
  }
}
