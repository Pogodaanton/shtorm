import React, { Component } from 'react'
import { Typography, Paper } from '@material-ui/core'
import DefaultGridItem from '../DefaultGridItem'

export default class index extends Component {
  render () {
    return (
      <DefaultGridItem name='not-found'>
        <Paper className='paper'>
          <div className='spotlight'>
            <Typography variant='h4'>404: Not found</Typography>
            <Typography variant='body1'>You tried to go to a page that does not exist. Wait, that&apos;s illegal!</Typography>
          </div>
        </Paper>
      </DefaultGridItem>
    )
  }
}
