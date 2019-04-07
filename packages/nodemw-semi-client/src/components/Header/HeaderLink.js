import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { IconButton, Tooltip } from '@material-ui/core'

const HeaderLink = ({ icon: Icon, tooltip, to }) => {
  return (
    <Tooltip title={tooltip}>
      <Link to={to}>
        <IconButton color='inherit'>
          <Icon />
        </IconButton>
      </Link>
    </Tooltip>
  )
}

HeaderLink.propTypes = {
  icon: PropTypes.any.isRequired,
  tooltip: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired
}

export default HeaderLink
