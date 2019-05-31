import React from 'react'
import PropTypes from 'prop-types'
import { Paper, Grid } from '@material-ui/core'

const GridPaper = ({ className, xs, sm, md, lg, xl, children }) => {
  return (
    <Grid
      className={className}
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
  className: PropTypes.string,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  children: PropTypes.any
}

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

export { DefaultGridItem as default, GridPaper }
