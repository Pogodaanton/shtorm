import './components/reboot.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { BrowserRouter as Router } from 'react-router-dom'
import config from './config.json'
import 'focus-visible'

const path = config.clientPath
if (!path) console.error('Key clientPath was not found in config.json. This might result to the page not being able to load properly.')

ReactDOM.render(<Router basename={config.clientPath}><App /></Router>, document.getElementById('root'))
