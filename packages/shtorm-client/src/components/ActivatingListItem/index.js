import React from 'react'
import { ListItem } from '@material-ui/core'
import { Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'

function ActivatingListItem ({ children, to, activeOnlyWhenExact, disabled }) {
  return (
    <Route
      path={to}
      exact={activeOnlyWhenExact}
    >
      {({ match }) => (
        <ListItem
          button
          selected={match && true}
          component={Link}
          to={to}
          disabled={disabled}
        >
          {children}
        </ListItem>
      )}
    </Route>
  )
}

ActivatingListItem.propTypes = {
  children: PropTypes.any,
  to: PropTypes.string,
  activeOnlyWhenExact: PropTypes.bool,
  disabled: PropTypes.bool
}

export { ActivatingListItem as default }
