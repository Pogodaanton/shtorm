import React, { Component, PureComponent } from 'react'
import { Typography, CircularProgress, Button, Link, Popover, IconButton } from '@material-ui/core'
import { withSnackbar } from 'notistack'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { UserContext } from '../../contexts/UserContext'
import PropTypes from 'prop-types'
import axios from 'axios'
import { withApi } from '../Api'
import bg from './background.jpg'
import './Login.scss'
import { CameraAlt } from '@material-ui/icons'

/**
 * Popover for spotlight BG information
 */
class SpotlightAboutPopover extends PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any.isRequired,
    requestClose: PropTypes.func.isRequired
  }

  render () {
    const { open, anchor, requestClose } = this.props
    return (
      <Popover
        open={!!open}
        anchorEl={anchor}
        onClose={requestClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Typography
          style={{
            padding: '10px 20px'
          }}
        >
          Photo by <Link
            href='https://unsplash.com/@markusspiske?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText'
            target='_blank'
            rel='noopener'
          >Markus Spiske</Link> on <Link
            href='https://unsplash.com/s/photos/programming?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText'
            target='_blank'
            rel='noopener'
          >Unsplash</Link>
        </Typography>
      </Popover>
    )
  }
};

class Login extends Component {
  static propTypes = {
    updateCurrentUser: PropTypes.func.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired
  }

  state = {
    username: '',
    password: '',
    loading: false,
    aboutPopoverOpen: false
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
        this.setState({ loading: false })
        this.props.api.axiosErrorHandler()(err)
      })
  }

  onInputChange = (input) => (e) => {
    let val = e.target.value
    if (e.target.type === 'checkbox') val = e.target.checked
    this.setState({ [input]: val })
  }

  toggleAboutPopover = (e) => {
    this.setState({ aboutPopoverOpen: !this.state.aboutPopoverOpen })
  }

  aboutButtonRef = null;
  setRef = (r) => { this.aboutButtonRef = r }

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
        <IconButton
          className='spotlight-about'
          ref={this.setRef}
          onClick={this.toggleAboutPopover}
          about='About the background image'
        ><CameraAlt /></IconButton>
        {this.aboutButtonRef && <SpotlightAboutPopover
          anchor={this.aboutButtonRef}
          open={this.state.aboutPopoverOpen}
          requestClose={this.toggleAboutPopover}
        />}
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
