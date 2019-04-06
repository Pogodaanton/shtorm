import React, { Component, createRef } from 'react'
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import PropTypes from 'prop-types'
import './TerminalWindow.scss'

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
})

export default class index extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    height: PropTypes.number,
    disableTransition: PropTypes.bool
  }

  List = createRef()
  AutoSizer = createRef()

  componentDidUpdate = () => {
    this.List.current.forceUpdate()
    this.List.current.forceUpdateGrid()
  }

  rowRenderer = ({
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
    parent
  }) => {
    const { timestamp, msg, type } = this.props.rows[index]

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={timestamp}
        parent={parent}
        rowIndex={index}
      >
        <div
          className={`terminal-item terminal-item-${type.toLowerCase()}`}
          key={timestamp}
          style={style}
        >
          [{type}] {new Date(timestamp).toLocaleTimeString()} - {msg}
        </div>
      </CellMeasurer>
    )
  }

  render () {
    return (
      <div
        className='terminal-window'
        style={{
          height: this.props.height,
          transitionDuration: this.props.disableTransition ? '0s' : '.2s'
        }}
      >
        <AutoSizer ref={this.AutoSizer}>
          {({ height, width }) => {
            this.terminalWidth = width
            return (
              <List
                ref={this.List}
                width={width}
                height={this.props.height - 10}
                rowCount={this.props.rows.length}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                rowRenderer={this.rowRenderer}
                style={{
                  marginTop: 5
                }}
              />
            )
          }}
        </AutoSizer>
      </div>
    )
  }
}
