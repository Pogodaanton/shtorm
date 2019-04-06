import React, { Component } from 'react'
import { Typography, Paper } from '@material-ui/core'

export default class index extends Component {
  render () {
    return (
      <Paper className='paper-center'>
        <Typography variant='h4'>Lorem Ipsum</Typography>
        <Typography variant='body1'>Dolor sit amet</Typography>
      </Paper>
    )
  }
}
