import React, { Component } from 'react'
import PropTypes from 'prop-types'

const foregroundColors = {
  '30': 'black',
  '31': 'red',
  '32': '#00b100',
  '33': 'yellow',
  '34': '#6f6fff',
  '35': 'purple',
  '36': 'cyan',
  '37': 'white'
}

export default class AnsiParser extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  }

  /**
   * I once found this code somewhere, but I have no clue where it is from.
   * Please don't sue me.
   */
  parseAnsi = (str) => {
    Object.keys(foregroundColors).forEach(function (ansi) {
      var span = '<span style="color: ' + foregroundColors[ansi] + '">'

      //
      // `\033[Xm` == `\033[0;Xm` sets foreground color to `X`.
      //

      str = str.replace(
        new RegExp('\\033\\[' + ansi + 'm', 'g'),
        span
      ).replace(
        new RegExp('\\033\\[0;' + ansi + 'm', 'g'),
        span
      )
    })
    //
    // `\033[1m` enables bold font, `\033[22m` disables it
    //
    str = str.replace(/\033\[1m/g, '<b>').replace(/\033\[22m/g, '</b>')

    //
    // `\033[3m` enables italics font, `\033[23m` disables it
    //
    str = str.replace(/\033\[3m/g, '<i>').replace(/\033\[23m/g, '</i>')

    str = str.replace(/\033\[m/g, '</span>')
    str = str.replace(/\033\[0m/g, '</span>')
    str = str.replace(/\033\[39m/g, '</span>')

    return { __html: str }
  }

  render () {
    return (
      <span dangerouslySetInnerHTML={this.parseAnsi(this.props.children)} />
    )
  }
}
