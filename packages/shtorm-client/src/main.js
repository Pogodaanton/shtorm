import './components/reboot.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { BrowserRouter as Router } from 'react-router-dom'
import ConfigContextProvider, { ConfigContext } from './contexts/ConfigContext'
import 'focus-visible'

ReactDOM.render((
  <ConfigContextProvider>
    <ConfigContext.Consumer>
      {(config) => (
        <Router basename={config.clientPath}>
          <App />
        </Router>
      )}
    </ConfigContext.Consumer>
  </ConfigContextProvider>
), document.getElementById('root'))
