import './components/reboot.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import MultiContext from './components/MultiContext'
import { BrowserRouter as Router } from 'react-router-dom'
import 'focus-visible'

ReactDOM.render(<Router><MultiContext><App /></MultiContext></Router>, document.getElementById('root'))
