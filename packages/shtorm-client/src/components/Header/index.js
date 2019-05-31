import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, CircularProgress } from '@material-ui/core'
import Loader from '../Loader'
import './Header.scss'

const TasksPopover = Loader('TasksPopover', () => null)
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
    tasksOpen: false
  }

  componentDidMount = () => TasksPopover.preload()

  toggleTasks = (e) => this.setState({ tasksOpen: !this.state.tasksOpen })

  iconButtonRef = null
  setIconButtonRef = (r) => { this.iconButtonRef = r }

  render () {
    const { tasksOpen } = this.state
    return (
      <AppBar
        id='page-header'
        position='static'
        color='primary'
      >
        <Toolbar variant='dense'>
          <span className='page-header-logo'>⛈</span>
          <ToolbarContent
            onIconButtonRef={this.setIconButtonRef}
            onTaskToggle={this.toggleTasks}
          />
        </Toolbar>
        {this.iconButtonRef && <TasksPopover
          open={tasksOpen}
          anchor={this.iconButtonRef}
          requestClose={this.toggleTasks}
        />}
      </AppBar>
    )
  }
}
