import React, { Component, createRef } from 'react'
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized'
import ReactJson from 'react-json-view'
import reactAnsiStyle from 'react-ansi-style'
import Measure from 'react-measure'
import PropTypes from 'prop-types'
import './TerminalView.scss'

const terminalLineCache = new CellMeasurerCache({
  defaultHeight: 50,
  fixedWidth: true
})

export default class TerminalView extends Component {
  static propTypes = {
    terminalLines: PropTypes.array.isRequired
  }

  shouldAutoScroll = true
  List = createRef()
  state = {
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.onWindowResize)
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onWindowResize)
  }

  componentDidUpdate = (prevProps) => {
    const { terminalLines } = this.props
    const { terminalLines: prevLines } = prevProps
    if (terminalLines.length !== prevLines.length && this.shouldAutoScroll) {
      this.List.current.scrollToRow(terminalLines.length)
    }
  }

  onWindowResize = (e) => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      if (typeof this.List.current !== 'undefined') {
        terminalLineCache.clearAll()
        this.List.current.forceUpdate()
        this.List.current.forceUpdateGrid()
      }
    }, 200)
  }

  onScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (scrollHeight > 0) {
      if ((scrollHeight - clientHeight - 5) > scrollTop) this.shouldAutoScroll = false
      else this.shouldAutoScroll = true
    }
  }

  forceUpdate = (index) => () => {
    terminalLineCache.clear(index)
    this.List.current.forceUpdate()
    this.List.current.forceUpdateGrid()
  }

  messageRenderer = (msg, index) => {
    switch (typeof msg) {
      case 'object':
        return (
          <Measure onResize={this.forceUpdate(index)}>
            {({ measureRef }) => (
              <div
                ref={measureRef}
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
            )}
          </Measure>
        )

      default:
        return reactAnsiStyle(React, msg)
    }
  }

  rowRenderer = ({
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style, // Style object to be applied to row (to position it)
    parent
  }) => {
    const { timestamp, msg, prefix, key } = this.props.terminalLines[index]

    return (
      <CellMeasurer
        cache={terminalLineCache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div
          className={`terminal-item terminal-item-${prefix.toLowerCase()}`}
          key={key}
          style={style}
        >
          <span className='terminal-item-info'>[{prefix}] {new Date(timestamp).toLocaleTimeString()} - </span>
          <span className='terminal-item-data'>{this.messageRenderer(msg, index)}</span>
        </div>
      </CellMeasurer>
    )
  }

  render () {
    return (
      <div className='terminal-window'>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.List}
              width={width}
              height={height - 10}
              rowCount={this.props.terminalLines.length}
              deferredMeasurementCache={terminalLineCache}
              rowHeight={terminalLineCache.rowHeight}
              rowRenderer={this.rowRenderer}
              onScroll={this.onScroll}
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
