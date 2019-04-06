import React, { Component } from 'react'
import { Typography, Paper } from '@material-ui/core'

export default class index extends Component {
  render () {
    return (
      <Paper className='paper-center'>
        <Typography variant='h4'>404: Not found</Typography>
        <Typography variant='body1'>You tried to go to a page which does not exist. Wait, that{'\''}s illegal!</Typography>
      </Paper>
    )
  }
}
