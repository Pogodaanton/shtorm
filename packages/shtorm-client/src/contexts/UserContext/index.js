import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import Axios from 'axios'
import { withApi } from '../../components/Api'
import FullscreenSpinner from '../../components/Spinners/Fullscreen'
import { SocketContext } from '../SocketContext'

export const UserContext = createContext()
class UserContextProvider extends Component {
  static contextType = SocketContext
  static propTypes = {
    api: PropTypes.object.isRequired,
    children: PropTypes.node
  }

  componentDidMount = () => this.updateCurrentUser()
  updateCurrentUser = () => {
    this.setState({ loading: true })
    Axios.get(this.props.api.getApiUrl('whoami'), { withCredentials: true })
      .then((res) => {
        if (this.props.api.axiosCheckResponse(res) && typeof res.data.data === 'object') {
          this.setState({
            currentUser: res.data.data,
            loading: false
          }, () => {
            if (typeof res.data.data.permissions === 'undefined') this.context.socket.disconnect()
            else this.context.socket.connect()
          })
        } else throw new Error('Wrong answer received!')
      })
      .catch(this.props.api.axiosErrorHandler(true))
  }

  getUserPermission = (permission) => {
    const { currentUser } = this.state
    if (typeof currentUser.permissions === 'undefined') return false
    if (permission !== 'isOriginal' && currentUser.permissions.isAdmin) return true
    return currentUser.permissions[permission] || false
  }

  state = {
    currentUser: null,
    updateCurrentUser: this.updateCurrentUser,
    getUserPermission: this.getUserPermission,
    loading: false
  }

  render () {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
        {this.state.loading && <FullscreenSpinner />}
      </UserContext.Provider>
    )
  }
}

export default withApi(UserContextProvider)
