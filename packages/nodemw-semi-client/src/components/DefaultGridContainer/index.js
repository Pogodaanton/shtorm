import React from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@material-ui/core'

const DefaultGridContainer = (props) => {
  return (
    <Grid
      {...props}
      className={props.name ? `grid-container-${props.name}` : 'grid-container-default'}
      container
      justify='center'
      alignContent='stretch'
      spacing={16}
    >
      {props.children}
    </Grid>
  )
}

DefaultGridContainer.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any
}

export default DefaultGridContainer
