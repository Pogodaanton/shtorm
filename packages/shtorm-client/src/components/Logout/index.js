import React, { Component } from 'react'
import { Paper } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { UserContext } from '../../contexts/UserContext'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'
import SpotlightLinear from '../Spinners/SpotlightLinear'
import DefaultGridItem from '../DefaultGridItem'

class Logout extends Component {
  static context = UserContext
  static propTypes = {
    history: PropTypes.object.isRequired,
    updateCurrentUser: PropTypes.func.isRequired,
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func
  }

  componentDidMount = () => this.requestLogout()
  requestLogout = () => {
    axios.get(Api.getApiUrl('logOut'), { withCredentials: true })
      .then((res) => {
        this.props.enqueueSnackbar('Successfully logged out!')
        this.props.updateCurrentUser()
      })
      .catch((err) => {
        this.props.history.push('/')
        Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
      })
  }

  render () {
    return (
      <DefaultGridItem name='logout'>
        <Paper className='paper'>
          <SpotlightLinear
            value={0}
            msg={'Logging you out...'}
          />
        </Paper>
      </DefaultGridItem>
    )
  }
}

const ContextAdder = (props) => (
  <UserContext.Consumer>
    {({ updateCurrentUser }) => (
      <Logout
        {...props}
        updateCurrentUser={updateCurrentUser}
      />
    )}
  </UserContext.Consumer>
)

export default withSnackbar(ContextAdder)
