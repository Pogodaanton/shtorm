import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, CircularProgress } from '@material-ui/core'
import Loader from '../Loader'
import './Header.scss'

const TasksPopover = Loader('TasksPopover', () => null)
const ProfilePopover = Loader('ProfilePopover', () => null)
const ToolbarContent = Loader('Header/ToolbarContent', ({ pastDelay }) => !pastDelay ? null : (
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
    tasksOpen: false,
    profileOpen: false
  }

  componentDidMount = () => {
    TasksPopover.preload()
    TasksPopover.preload()
  }

  togglePopover = (popoverType) => (e) => {
    const stateName = popoverType + 'Open'
    this.setState({ [stateName]: !this.state[stateName] })
  }

  tasksButtonRef = null
  profileButtonRef = null
  setRef = (refType) => (r) => { this[refType + 'ButtonRef'] = r }

  render () {
    const { tasksOpen, profileOpen } = this.state
    return (
      <AppBar
        id='page-header'
        position='static'
        color='primary'
      >
        <Toolbar variant='dense'>
          <span className='page-header-logo'>⛈</span>
          <ToolbarContent
            onTasksButtonRef={this.setRef('tasks')}
            onTaskToggle={this.togglePopover('tasks')}
            onProfileButtonRef={this.setRef('profile')}
            onProfileToggle={this.togglePopover('profile')}
          />
        </Toolbar>
        {this.tasksButtonRef && <TasksPopover
          open={tasksOpen}
          anchor={this.tasksButtonRef}
          requestClose={this.togglePopover('tasks')}
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
