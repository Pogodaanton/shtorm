import React, { Component } from 'react'
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import PropTypes from 'prop-types'
import './TerminalWindow.scss'

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
})

export default class index extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired
  }

  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
    parent
  }) => {
    const row = this.props.rows[index]

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div
          className={`terminal-item terminal-item-${row.type}`}
          key={key}
          style={style}
        >
          {row.msg}
        </div>
      </CellMeasurer>
    )
  }

  render () {
    return (
      <div className='terminal-window'>
        <AutoSizer>
          {({ height, width }) => {
            this.terminalWidth = width
            return (
              <List
                width={width}
                height={height}
                rowCount={this.props.rows.length}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                rowRenderer={this.rowRenderer}
              />
            )
          }}
        </AutoSizer>
      </div>
    )
  }
}
