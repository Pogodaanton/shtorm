import React from 'react'
import PropTypes from 'prop-types'
import { Fab, Tooltip } from '@material-ui/core'
import { Refresh, Add } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

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
    <UserContext.Consumer>
      {({ getUserPermission }) => getUserPermission('createProjects') && (
        <Tooltip title='Add project'>
          <Fab
            color='primary'
            component={Link}
            to='/projects/edit/add'
          >
            <Add />
          </Fab>
        </Tooltip>
      )}
    </UserContext.Consumer>
  </div>
)

ProjectListFabs.propTypes = {
  onUpdateListClick: PropTypes.func.isRequired
}

export default ProjectListFabs
