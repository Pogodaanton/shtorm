import React, { Component, Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { GridPaper } from '../DefaultGridItem'
import { withApi } from '../Api'
import UsersList from './UsersList'
import PropTypes from 'prop-types'
import axios from 'axios'
import Loader from '../Loader'
import { UserContext } from '../../contexts/UserContext'

const UserEditor = Loader(import('./UserEditor'))
const UsersSelect = Loader(import('./UsersSelect'), () => null)

class Users extends Component {
  static contextType = UserContext
  static propTypes = {
    api: PropTypes.object.isRequired,
    history: PropTypes.object
  }

  state = {
    loading: true,
    userList: []
  }

  componentDidMount = () => {
    if (this.context.getUserPermission('isAdmin')) this.getAllUsers()
    UserEditor.preload()
  }

  getAllUsers = () => {
    axios.get(this.props.api.getApiUrl('getAllUsers'), { withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          userList: res.data.data,
          loading: false
        })
      })
      .catch(this.props.api.axiosErrorHandler(true, this.props.history))
  }

  render () {
    const { loading, userList } = this.state
    const { isAdmin } = (this.context.currentUser.permissions || this.context.currentUser)
    const editorPaperProps = isAdmin ? {
      xs: 12,
      sm: 7,
      md: 8,
      lg: 7
    } : {
      xs: 12,
      sm: 11,
      md: 10,
      lg: 9,
      xl: 8
    }

    return (
      <Fragment>
        {isAdmin && (
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
        )}
        <GridPaper
          className='grid-split'
          {...editorPaperProps}
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
              component={isAdmin ? UsersSelect : () => <Redirect to='/' />}
            />
          </Switch>
        </GridPaper>
      </Fragment>
    )
  }
}

export default withApi(Users)
