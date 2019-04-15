import React, { PureComponent } from 'react'
import { TableCell, TableSortLabel } from '@material-ui/core'
import { AutoSizer, Column, SortDirection, Table } from 'react-virtualized'
import PropTypes from 'prop-types'
import './MaterialTableVirtualized.scss'

// Code originally from https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/tables/ReactVirtualizedTable.js
export default class MaterialTableVirtualized extends PureComponent {
  static propTypes = {
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        cellContentRenderer: PropTypes.func,
        dataKey: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired
      })
    ).isRequired,
    headerHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    rowClassName: PropTypes.string,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    sort: PropTypes.func
  }

  static defaultProps = {
    headerHeight: 56,
    rowHeight: 56
  }

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { columns, rowHeight } = this.props
    return (
      <TableCell
        component='div'
        variant='body'
        className='mui-vtable-cell-body'
        style={{ height: rowHeight }}
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {cellData}
      </TableCell>
    )
  };

  headerRenderer = ({ label, columnIndex, dataKey, sortBy, sortDirection, className = '' }) => {
    const { headerHeight, columns, sort } = this.props
    const direction = {
      [SortDirection.ASC]: 'asc',
      [SortDirection.DESC]: 'desc'
    }

    const inner =
      !columns[columnIndex].disableSort && sort != null ? (
        <TableSortLabel
          active={dataKey === sortBy}
          direction={direction[sortDirection]}
        >
          {label}
        </TableSortLabel>
      ) : (
        label
      )

    return (
      <TableCell
        component='div'
        variant='head'
        className={['mui-vtable-cell-header', className].join(' ')}
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        {inner}
      </TableCell>
    )
  };

  render () {
    const { columns, ...tableProps } = this.props
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            {...tableProps}
            className='mui-vtable'
            rowClassName='mui-vtable-row'
          >
            {columns.map(({ cellContentRenderer = null, className = '', headerClassName = '', dataKey, ...other }, index) => {
              let renderer
              if (cellContentRenderer != null) {
                renderer = cellRendererProps =>
                  this.cellRenderer({
                    cellData: cellContentRenderer(cellRendererProps),
                    columnIndex: index
                  })
              } else {
                renderer = this.cellRenderer
              }

              return (
                <Column
                  key={dataKey}
                  className={['mui-vtable-column', className].join(' ')}
                  headerRenderer={headerProps =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                      className: headerClassName
                    })
                  }
                  cellRenderer={renderer}
                  dataKey={dataKey}
                  {...other}
                />
              )
            })}
          </Table>
        )}
      </AutoSizer>
    )
  }
}
