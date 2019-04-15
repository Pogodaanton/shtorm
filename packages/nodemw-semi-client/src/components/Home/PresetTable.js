import React, { Component, Fragment } from 'react'
import { Button, IconButton, Tooltip } from '@material-ui/core'
import { Link } from 'react-router-dom'
import PlayIcon from '@material-ui/icons/PlayArrow'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import MaterialTable from '../MaterialTableVirtualized'
import PropTypes from 'prop-types'

export default class PresetTable extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired
  }

  state = {
    rows: []
  }

  componentDidMount = () => {
    let { rows } = this.props
    rows = rows.map((row) => {
      row.favicon = (
        <img
          src={row.favicon}
          alt={`Favicon for preset ${row.name}`}
          width={16}
          height={16}
        />
      )

      const urlFriendlyName = encodeURIComponent(row.name)
      row.buttons = (
        <Fragment>
          <Tooltip title='Delete preset'>
            <IconButton
              component={Link}
              to={`/delete/${urlFriendlyName}`}
            ><DeleteIcon /></IconButton>
          </Tooltip>
          <Tooltip title='Edit preset'>
            <IconButton
              component={Link}
              to={`/edit/${urlFriendlyName}`}
            ><EditIcon /></IconButton>
          </Tooltip>
          <Button
            color='secondary'
            variant='outlined'
            onClick={this.onRowButtonClick('start', row.name)}
            style={{ marginLeft: 5 }}
          ><PlayIcon style={{ marginRight: 10 }} /> Start</Button>
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
            label: 'Preset Name',
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
