import React, { Component, Fragment } from 'react'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { PlayArrow, Edit, Share } from '@material-ui/icons'
import MaterialTable from '../MaterialTableVirtualized'
import { UserContext } from '../../contexts/UserContext'
import PropTypes from 'prop-types'

export default class ProjectTable extends Component {
  static contextType = UserContext
  static propTypes = {
    rows: PropTypes.array.isRequired
  }

  state = {
    rows: []
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.rows !== prevProps.rows) this.fixRows()
  }

  componentDidMount = () => this.fixRows()

  fixRows = () => {
    let { rows } = this.props
    rows = rows.map((row) => {
      row.favicon = (
        <img
          src={row.favicon}
          alt={`Favicon for project ${row.name}`}
          width={16}
          height={16}
        />
      )

      const { id } = row
      const hasNoConfig = row.config === 'DELETED'
      const canCreateProjects = this.context.getUserPermission('createProjects')
      row.buttons = (
        <Fragment>
          {canCreateProjects && (
            <Tooltip title='Edit project'>
              <IconButton
                component={Link}
                to={`/projects/edit/${id}`}
              ><Edit /></IconButton>
            </Tooltip>
          )}
          <Tooltip
            title={
              hasNoConfig
                ? canCreateProjects
                  ? 'The bot config for this project was deleted, please assign a new config for it first.'
                  : 'The bot config for this project was deleted, it cannot be executed until a new config is assigned to it.'
                : ''
            }
          >
            <div>
              {this.context.getUserPermission('assignProjects') && (
                <Tooltip title='Share project'>
                  <IconButton
                    component={Link}
                    disabled={hasNoConfig}
                    to={`/projects/share/${id}`}
                  ><Share /></IconButton>
                </Tooltip>
              )}
              <Button
                color='secondary'
                variant='outlined'
                component={Link}
                disabled={hasNoConfig}
                to={`/projects/start/${id}`}
                style={{ marginLeft: 5 }}
              ><PlayArrow style={{ marginRight: 10 }} />Start</Button>
            </div>
          </Tooltip>
        </Fragment>
      )
      return row
    })

    this.setState({ rows })
  }

  onRowButtonClick = (action, name) => (e) => {
    const { rows } = this.state
    const row = rows[rows.findIndex((row) => row.name === name)]
    console.log({ action, row })
  }

  render () {
    const { rows } = this.state
    return (
      <MaterialTable
        rowCount={rows.length}
        rowGetter={({ index }) => rows[index]}
        columns={[
          {
            width: 20,
            label: '',
            dataKey: 'favicon',
            className: 'mui-vtable-column-favicon',
            headerClassName: 'mui-vtable-cell-header-favicon',
            flexShrink: 0
          },
          {
            width: 120,
            label: 'Project Name',
            dataKey: 'name',
            flexGrow: 1,
            flexShrink: 0.2
          },
          {
            width: 90,
            label: 'Script',
            dataKey: 'script',
            flexGrow: 1,
            flexShrink: 0.8
          },
          {
            width: 120,
            label: 'Config',
            dataKey: 'config',
            flexGrow: 1,
            flexShrink: 3
          },
          {
            width: 90,
            label: 'Created by',
            dataKey: 'origin',
            flexGrow: 1,
            flexShrink: 3
          },
          {
            width: 250,
            label: '',
            dataKey: 'buttons',
            flexShrink: 0
          }
        ]}
      />
    )
  }
}
