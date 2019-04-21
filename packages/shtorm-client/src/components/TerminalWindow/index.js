import React, { Component, createRef } from 'react'
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import PropTypes from 'prop-types'
import AnsiParser from './AnsiParser'
import './TerminalWindow.scss'

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
})

export default class index extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    disableTransition: PropTypes.bool
  }

  resizeTimer = null
  List = createRef()
  AutoSizer = createRef()

  state = {
    height: 0
  }

  forceUpdate = () => {
    if (typeof this.List.current !== 'undefined') {
      cache.clearAll()
      this.List.current.forceUpdate()
      this.List.current.forceUpdateGrid()
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.disableTransition !== this.props.disableTransition) this.onWindowResize()
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.onWindowResize)
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onWindowResize)
  }

  onWindowResize = (e) => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(this.forceUpdate, 200)
  }

  rowRenderer = ({
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
    parent
  }) => {
    const { timestamp, msg, type, key } = this.props.rows[index]

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div
          className={`terminal-item terminal-item-${type.toLowerCase()}`}
          key={timestamp}
          style={style}
        >
          [{type}] {new Date(timestamp).toLocaleTimeString()} - <AnsiParser>{msg}</AnsiParser>
        </div>
      </CellMeasurer>
    )
  }

  render () {
    return (
      <div className='terminal-window' >
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.List}
              width={width}
              height={height - 10}
              rowCount={this.props.rows.length}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              rowRenderer={this.rowRenderer}
              style={{
                marginTop: 5
              }}
            />
          )}
        </AutoSizer>
      </div>
    )
  }
}
