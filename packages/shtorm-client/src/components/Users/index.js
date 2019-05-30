import React, { Component, Fragment } from 'react'
import { Paper, Grid } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import UsersSelect from './UsersSelect'
import UsersList from './UsersList'
import UserEditor from './UserEditor'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

function GridPaper ({ className, xs, sm, md, lg, xl, children }) {
  return (
    <Grid
      className={className}
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
    >
      <Paper className='paper'>
        {children}
      </Paper>
    </Grid>
  )
}

GridPaper.propTypes = {
  className: PropTypes.string,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  children: PropTypes.any
}

class Users extends Component {
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
    history: PropTypes.object
  }

  state = {
    loading: true,
    userList: []
  }

  componentDidMount = () => {
    this.getAllUsers()
  }

  getAllUsers = () => {
    axios.get(Api.getApiUrl('getAllUsers'), { withCredentials: true })
      .then((res) => {
        if (!Api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          userList: res.data.data,
          loading: false
        })
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar, this.props.history))
  }

  render () {
    const { loading, userList } = this.state
    return (
      <Fragment>
        <GridPaper
          className='grid-split'
          xs={12}
          sm={5}
          md={3}
          xl={2}
        >
          <UsersList
            loading={loading}
            list={userList}
          />
        </GridPaper>
        <GridPaper
          className='grid-split'
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <Switch>
            <Route
              path='/users/:id'
              component={(props) => (
                <UserEditor
                  {...props}
                  onReloadRequest={this.getAllUsers}
                />
              )}
            />
            <Route
              path='/users'
              component={UsersSelect}
            />
          </Switch>
        </GridPaper>
      </Fragment>
    )
  }
}

export default withSnackbar(Users)
