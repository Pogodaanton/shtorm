import { Component } from 'react'
import { MultiContext } from '../MultiContext'
import './home.scss'

export default class index extends Component {
  static contextType = MultiContext

  componentWillMount = () => {
    this.context.setTerminalHeight(this.context.desiredTerminalHeight)
  }

  render () {
    return null
  }
}
