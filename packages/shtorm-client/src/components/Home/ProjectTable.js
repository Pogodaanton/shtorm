import React, { Component, Fragment } from 'react'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Link } from 'react-router-dom'
import PlayIcon from '@material-ui/icons/PlayArrow'
import EditIcon from '@material-ui/icons/Edit'
import FastForwardIcon from '@material-ui/icons/FastForward'
import MaterialTable from '../MaterialTableVirtualized'
import PropTypes from 'prop-types'

export default class ProjectTable extends Component {
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
      row.buttons = (
        <Fragment>
          <Tooltip title='Edit project'>
            <IconButton
              component={Link}
              to={`/projects/${id}`}
            ><EditIcon /></IconButton>
          </Tooltip>
          <Tooltip title={hasNoConfig ? 'The bot config for this project was deleted, please assign a new config for it first.' : ''}>
            <div>
              <Tooltip title='Start project with defaults'>
                <IconButton
                  component={Link}
                  disabled={hasNoConfig}
                  to={`/start/${id}/skip`}
                ><FastForwardIcon /></IconButton>
              </Tooltip>
              <Button
                color='secondary'
                variant='outlined'
                component={Link}
                disabled={hasNoConfig}
                to={`/start/${id}`}
                style={{ marginLeft: 5 }}
              ><PlayIcon style={{ marginRight: 10 }} />Start</Button>
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
            flexGrow: 1
          },
          {
            width: 120,
            label: 'Config',
            dataKey: 'config',
            flexGrow: 1
          },
          {
            width: 268,
            label: '',
            dataKey: 'buttons',
            flexShrink: 0.1
          }
        ]}
      />
    )
  }
}
