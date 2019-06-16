import React, { Component, Fragment } from 'react'
import { Route } from 'react-router-dom'
import { Paper, Typography, Divider } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import DefaultGridItem from '../DefaultGridItem/index'
import Fullscreen from '../Spinners/Fullscreen'
import { UserContext } from '../../contexts/UserContext'
import Loader from '../Loader'
import Api from '../Api'
import axios from 'axios'
import PropTypes from 'prop-types'
import { NoProjects, NoProjectsCreatePrompt } from './NoProjects'
import './home.scss'

const Share = Loader(import('../Share'))
const ProjectEditorDialog = Loader(import('../ProjectEditorDialog'), () => null)
const ProjectsTable = Loader(import('./ProjectTable'), () => null)
const ProjectListFabs = Loader(import('./ProjectListFabs'), () => null)
const QuickStartList = Loader(import('./QuickStartList'), () => (
  <Typography
    className='project-selector-scripts-loading'
    variant='body2'
  >Acquiring list...</Typography>
))

class Home extends Component {
  static contextType = UserContext
  static propTypes = {
    location: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
    closeSnackbar: PropTypes.func.isRequired
  }

  state = {
    loading: true,
    scripts: null,
    projects: []
  }

  componentDidMount = () => this.updateProjectList()
  componentDidUpdate = (prevProps) => {
    if (
      typeof prevProps.location.pathname !== 'undefined' &&
      prevProps.location.pathname !== this.props.location.pathname &&
      this.props.location.pathname === '/'
    ) this.updateProjectList()
  }

  updateProjectList = () => {
    axios.get(Api.getApiUrl('getAllProjects'), { withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res)) {
          const { projects, scripts } = res.data.data
          this.setState({ projects, scripts, loading: false })
        }
      })
      .catch((err) => {
        this.setState({ loading: false })
        Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
      })
  }

  render () {
    const { loading, scripts, projects } = this.state
    const canCreateProjects = this.context.getUserPermission('createProjects')

    return (
      <DefaultGridItem name='home'>
        {loading && <Fullscreen />}
        <Paper className='paper paper-project-selector'>
          <Typography variant='h5'>Welcome Back!</Typography>
          <Typography variant='subtitle1'>
            {
              canCreateProjects
                ? 'Choose the next project you want to work on or create a new one from scratch.'
                : 'Choose the next project you want to work on.'
            }
          </Typography>
          <Divider />
          { canCreateProjects && (
            <Fragment>
              <div className='project-selector-scripts'>
                <Typography variant='body1'>Quick start:</Typography>
                <QuickStartList scripts={scripts} />
              </div>
              <Divider />
            </Fragment>
          )}
          <div className='project-selector-projects'>
            {
              projects.length > 0
                ? <ProjectsTable rows={projects} />
                : canCreateProjects
                  ? <NoProjectsCreatePrompt />
                  : <NoProjects />
            }
          </div>
          <ProjectListFabs onUpdateListClick={this.updateProjectList} />
        </Paper>
        <Route
          path='/projects/edit/:id'
          component={ProjectEditorDialog}
        />
        <Route
          path='/projects/share/:id'
          component={Share}
        />
      </DefaultGridItem>
    )
  }
}

export default withSnackbar(Home)
