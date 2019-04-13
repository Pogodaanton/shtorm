import React from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@material-ui/core'

const DefaultGridItem = (props) => {
  return (
    <Grid
      className={props.name ? `grid-item-${props.name}` : 'grid-item-default'}
      item
      xs={12}
      sm={11}
      md={10}
      lg={9}
      xl={8}
    >
      {props.children}
    </Grid>
  )
}

DefaultGridItem.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any
}

export default DefaultGridItem
