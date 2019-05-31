import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import { GridPaper } from '../DefaultGridItem'
import UsersSelect from './UsersSelect'
import UsersList from './UsersList'
import UserEditor from './UserEditor'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

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
