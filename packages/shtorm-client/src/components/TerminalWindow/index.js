import React, { Component, createRef } from 'react'
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import PropTypes from 'prop-types'
import ReactJson from 'react-json-view'
import AnsiParser from './AnsiParser'
import './TerminalWindow.scss'

const cache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
})

export default class index extends Component {
  static propTypes = {
    rows: PropTypes.array.isRequired,
    forceUpdateRef: PropTypes.func
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

  componentDidMount = () => {
    window.addEventListener('resize', this.onWindowResize)
    if (typeof this.props.forceUpdateRef === 'function') this.props.forceUpdateRef(this.forceUpdate)
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onWindowResize)
    if (typeof this.props.forceUpdateRef === 'function') this.props.forceUpdateRef(() => null)
  }

  onWindowResize = (e) => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(this.forceUpdate, 200)
  }

  messageRenderer = (msg) => {
    switch (typeof msg) {
      case 'object':
        return (
          <div
            onClick={() => setTimeout(this.forceUpdate, 10)}
            style={{ display: 'inline-block' }}
          >
            <ReactJson
              src={msg}
              collapsed
              iconStyle='triangle'
              theme='monokai'
              style={{ background: 'black' }}
            />
          </div>
        )

      default:
        return <AnsiParser>{msg}</AnsiParser>
    }
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
          key={key}
          style={style}
        >
          [{type}] {new Date(timestamp).toLocaleTimeString()} - {this.messageRenderer(msg)}
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
