import React, { Component } from 'react'
import { Typography, CircularProgress, Button } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { UserContext } from '../../contexts/UserContext'
import PropTypes from 'prop-types'
import axios from 'axios'
import { withApi } from '../Api'
import bg from './background.jpg'
import './Login.scss'

class Login extends Component {
  static propTypes = {
    updateCurrentUser: PropTypes.func.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired
  }

  state = {
    username: '',
    password: '',
    loading: false
  }

  postLogin = () => {
    const { username, password } = this.state
    this.setState({ loading: true })

    axios.post(this.props.api.getApiUrl('logIn'), { username, password }, { withCredentials: true })
      .then((res) => {
        this.setState({ loading: false })
        this.props.enqueueSnackbar('Successfully logged in!')
        this.props.updateCurrentUser()
      })
      .catch((err) => {
        console.log(err.res)
        this.setState({ loading: false })
        this.props.api.axiosErrorHandler()(err)
      })
  }

  onInputChange = (input) => (e) => {
    let val = e.target.value
    if (e.target.type === 'checkbox') val = e.target.checked
    this.setState({ [input]: val })
  }

  render () {
    const { username, password, loading } = this.state
    return (
      <div className='spotlight spotlight-visible spotlight-login'>
        <Typography variant='h4'>Shtorm | Login</Typography>
        <ValidatorForm onSubmit={this.postLogin}>
          <TextValidator
            variant='outlined'
            label='Username'
            value={username}
            required
            fullWidth
            disabled={loading}
            onChange={this.onInputChange('username')}
          />
          <TextValidator
            variant='outlined'
            label='Password'
            type='password'
            value={password}
            required
            fullWidth
            disabled={loading}
            onChange={this.onInputChange('password')}
          />
          <Button
            type='submit'
            color='primary'
            variant='contained'
            disabled={loading}
            fullWidth
          >
            {loading && <CircularProgress size={24} /> }
                Log In
          </Button>
        </ValidatorForm>
        <div
          className='login-background'
          style={{ backgroundImage: `url("${bg}")` }}
        />
      </div>
    )
  }
}

const ContextAdder = (props) => (
  <UserContext.Consumer>
    {({ updateCurrentUser }) => (
      <Login
        {...props}
        updateCurrentUser={updateCurrentUser}
      />
    )}
  </UserContext.Consumer>
)

export default withApi(withSnackbar(ContextAdder))
