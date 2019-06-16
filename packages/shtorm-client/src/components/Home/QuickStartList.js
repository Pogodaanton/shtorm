import React from 'react'
import PropTypes from 'prop-types'
import { Typography, Chip, Avatar } from '@material-ui/core'
import { InsertDriveFile } from '@material-ui/icons'
import { Link } from 'react-router-dom'

const QuickStart = ({ scripts }) => {
  return (typeof scripts !== 'object' || scripts === null) ? (
    <Typography
      className='project-selector-scripts-loading'
      variant='body2'
    >Acquiring list...</Typography>
  ) : scripts.length <= 0 ? (
    <Typography
      className='project-selector-scripts-empty'
      variant='body2'
    >No files were found in the ./scripts directory.</Typography>
  ) : scripts.map((scriptName, index) => (
    <Chip
      className='project-selector-scripts-chip'
      key={scriptName}
      label={scriptName}
      color='secondary'
      avatar={<Avatar><InsertDriveFile /></Avatar>}
      clickable
      component={Link}
      to={`/quickstart?script=${encodeURIComponent(scriptName)}`}
    />
  ))
}

QuickStart.propTypes = {
  scripts: PropTypes.any
}

export default QuickStart
