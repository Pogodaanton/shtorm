import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, CircularProgress } from '@material-ui/core'
import Loader from '../Loader'
import './Header.scss'

const ProcessExplorer = Loader(import('../ProcessExplorer'), () => null)
const ProfilePopover = Loader(import('../ProfilePopover'), () => null)
const ToolbarContent = Loader(import('../Header/ToolbarContent'), ({ pastDelay }) => !pastDelay ? null : (
  <Fragment>
    <CircularProgress
      color='primary'
      className='spinner-progress'
      size={22}
    />
    Loading Toolbar...
  </Fragment>
))

export default class index extends Component {
  state = {
    processExOpen: false,
    profileOpen: false
  }

  componentDidMount = () => {
    ProcessExplorer.preload()
  }

  togglePopover = (popoverType) => (e) => {
    const stateName = popoverType + 'Open'
    this.setState({ [stateName]: !this.state[stateName] })
  }

  processExButtonRef = null
  profileButtonRef = null
  setRef = (refType) => (r) => { this[refType + 'ButtonRef'] = r }

  render () {
    const { processExOpen, profileOpen } = this.state
    return (
      <AppBar
        id='page-header'
        position='static'
        color='primary'
      >
        <Toolbar variant='dense'>
          <span className='page-header-logo'>⛈</span>
          <ToolbarContent
            onProcessExplorerButtonRef={this.setRef('processEx')}
            onProcessExplorerToggle={this.togglePopover('processEx')}
            onProfileButtonRef={this.setRef('profile')}
            onProfileToggle={this.togglePopover('profile')}
          />
        </Toolbar>
        {this.processExButtonRef && <ProcessExplorer
          open={processExOpen}
          anchor={this.processExButtonRef}
          requestClose={this.togglePopover('processEx')}
        />}
        {this.profileButtonRef && <ProfilePopover
          open={profileOpen}
          anchor={this.profileButtonRef}
          requestClose={this.togglePopover('profile')}
        />}
      </AppBar>
    )
  }
}
