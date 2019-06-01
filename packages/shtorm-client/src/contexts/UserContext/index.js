import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import Axios from 'axios'
import Api from '../../components/Api'
import FullscreenSpinner from '../../components/Spinners/Fullscreen'
import { withSnackbar } from 'notistack'

export const UserContext = createContext()
class UserContextProvider extends Component {
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
    children: PropTypes.node
  }

  componentDidMount = () => this.updateCurrentUser()
  updateCurrentUser = () => {
    this.setState({ loading: true })
    Axios.get(Api.getApiUrl('getLoginInformation'), { withCredentials: true })
      .then((res) => {
        if (Api.axiosCheckResponse(res) && typeof res.data.data === 'object') {
          this.setState({
            currentUser: res.data.data,
            loading: false
          })
        } else throw new Error('Wrong answer received!')
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
  }

  state = {
    currentUser: {},
    updateCurrentUser: this.updateCurrentUser,
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

export default withSnackbar(UserContextProvider)
