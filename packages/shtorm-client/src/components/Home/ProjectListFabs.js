import React from 'react'
import PropTypes from 'prop-types'
import { Fab, Tooltip } from '@material-ui/core'
import { Refresh, Add } from '@material-ui/icons'
import { Link } from 'react-router-dom'

const ProjectListFabs = ({ onUpdateListClick }) => (
  <div className='project-selector-fabs'>
    <Tooltip title='Refresh list'>
      <Fab
        size='small'
        onClick={onUpdateListClick}
      >
        <Refresh />
      </Fab>
    </Tooltip>
    <Tooltip title='Add project'>
      <Fab
        color='primary'
        component={Link}
        to='/projects/add'
      >
        <Add />
      </Fab>
    </Tooltip>
  </div>
)

ProjectListFabs.propTypes = {
  onUpdateListClick: PropTypes.func.isRequired
}

export default ProjectListFabs
