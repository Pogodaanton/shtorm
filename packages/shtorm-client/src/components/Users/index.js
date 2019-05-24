import React, { Component, Fragment } from 'react'
import { Typography, Paper, Grid } from '@material-ui/core'
import UsersSelect from './UsersSelect'
import PropTypes from 'prop-types'

function GridPaper ({ xs, sm, md, lg, xl, children }) {
  return (
    <Grid
      className='grid-split'
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
    >
      <Paper className='paper'>
        {children}
      </Paper>
    </Grid>
  )
}

GridPaper.propTypes = {
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  children: PropTypes.any
}

export default class Users extends Component {
  render () {
    return (
      <Fragment>
        <GridPaper
          xs={12}
          sm={5}
          md={3}
          xl={2}
        >
          <div className='spotlight'>
            <Typography variant='h4'>Left</Typography>
            <Typography variant='body1'>You tried to go to a page that does not exist. Wait, that&apos;s illegal!</Typography>
          </div>
        </GridPaper>
        <GridPaper
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <UsersSelect />
        </GridPaper>
      </Fragment>
    )
  }
}
