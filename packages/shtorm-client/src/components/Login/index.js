import React, { Component } from 'react'
import { Typography, Paper, CircularProgress, Button } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'
import DefaultGridItem from '../DefaultGridItem'
import './Login.scss'

class Login extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func
  }

  state = {
    username: '',
    password: '',
    loading: false
  }

  postLogin = () => {
    const { username, password } = this.state
    this.setState({ loading: true })

    axios.post(Api.getApiUrl('logIn'), { username, password }, { withCredentials: true })
      .then((res) => {
        console.log(res)
        this.setState({ loading: false })
        this.props.enqueueSnackbar('Successfully logged in!')
        this.props.history.push('/')
      })
      .catch((err) => {
        console.log(err.res)
        this.setState({ loading: false })
        Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
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
      <DefaultGridItem name='login'>
        <Paper className='paper'>
          <div className='spotlight spotlight-visible'>
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
          </div>
        </Paper>
      </DefaultGridItem>
    )
  }
}

export default withSnackbar(Login)
