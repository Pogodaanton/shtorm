import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import { FormGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Button, Divider, Tooltip, Typography } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { CloudUpload, CloudQueue, CloudDone, Delete } from '@material-ui/icons'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'
import { UserContext } from '../../contexts/UserContext'
import './UserEditor.scss'

class UserEditor extends Component {
  static contextType = UserContext
  static propTypes = {
    onReloadRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func
  }

  nameList = []
  origState = {}
  state = {
    saveState: 'Saved',
    isNew: false,
    loading: true,
    id: '',
    username: '',
    password: '',
    newPassword: '',
    isAdmin: false,
    isOriginal: false,
    executePresets: true,
    modifyPresets: false,
    createPresets: false,
    createConfigs: false
  }

  componentDidMount = () => {
    ValidatorForm.addValidationRule('', () => true)

    ValidatorForm.addValidationRule('notEmpty', (value) => {
      if (value.trim() === '') return false
      return true
    })

    ValidatorForm.addValidationRule('wordBlacklist', (value) => {
      if (value.trim() === 'add') return false
      for (let i in this.nameList) {
        const username = this.nameList[i]
        if (
          (username === value.trim() && typeof this.origState.username === 'undefined') ||
          (username === value.trim() && username !== this.origState.username)
        ) return false
      }
      return true
    })
    this.componentDidUpdate({})
  }

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.match !== this.props.match &&
      typeof this.props.match.params === 'object' &&
      typeof this.props.match.params.id !== 'undefined'
    ) {
      const { id } = this.props.match.params
      if (this.context.getUserPermission('isAdmin')) this.getTakenUsernames()
      if (id === 'add') this.setupNewUser()
      else this.getUserData(id)
    }
  }

  setupNewUser = () => {
    this.setState({
      isNew: true,
      loading: false,
      id: 'add',
      saveState: 'Save'
    })
  }

  getTakenUsernames = () => {
    axios.get(Api.getApiUrl('getAllUsernames'), { withCredentials: true })
      .then((res) => {
        if (!Api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.nameList = res.data.data
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar))
  }

  getUserData = (id) => {
    axios.get(Api.getApiUrl('getUser'), { params: { id }, withCredentials: true })
      .then((res) => {
        if (!Api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          loading: false,
          ...res.data.data
        }, this.setOrigState)
      })
      .catch((err) => {
        Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
        this.props.history.replace('/users')
      })
  }

  setOrigState = () => {
    this.origState = { ...this.state }
    delete this.origState.saveState
  }

  postUserData = () => {
    const {
      id,
      username,
      password,
      isAdmin,
      newPassword,
      modifyPresets,
      createPresets,
      createConfigs
    } = this.state

    this.setState({
      saveState: 'Saving',
      loading: true
    }, () => {
      axios.post(Api.getApiUrl('saveUser'), {
        id,
        username,
        password: password || newPassword,
        isAdmin,
        modifyPresets,
        createPresets,
        createConfigs
      }, { withCredentials: true })
        .then((res) => {
          if (!Api.axiosCheckResponse(res)) throw new Error('Wrong result received!')

          this.props.enqueueSnackbar('User successfully saved')
          if (typeof res.data.newId === 'string') {
            this.props.onReloadRequest()
            this.props.history.replace(`/users/${res.data.newId}`)
          } else {
            this.setState({ saveState: 'Saved', loading: false, password: '' }, () => {
              if (this.context.getUserPermission('isAdmin')) this.props.onReloadRequest()
              this.setOrigState()
            })
          }
        })
        .catch((err) => {
          this.setState({ saveState: 'Save', loading: false })
          Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
        })
    })
  }

  postDeleteUser = () => {
    const { id } = this.state

    this.setState({
      saveState: 'Deleting',
      loading: true
    }, () => {
      axios.post(Api.getApiUrl('deleteUser'), { id }, { withCredentials: true })
        .then((res) => {
          this.props.onReloadRequest()
          this.props.history.replace('/users')
        })
        .catch((err) => {
          this.setState({ saveState: 'Save', loading: false })
          Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar)(err)
        })
    })
  }

  onInputChange = (input) => (e) => {
    let val = e.target.value
    if (e.target.type === 'checkbox') val = e.target.checked
    this.saveCheck({ [input]: val })
  }

  saveCheck = (addition = {}) => {
    let saveState = 'Saved'
    const diffObj = { ...this.state, ...addition }
    delete diffObj.saveState

    if (!isEqual(diffObj, this.origState)) saveState = 'Save'
    this.setState({ ...addition, saveState })
  }

  render () {
    const {
      saveState,
      isNew,
      username,
      newPassword,
      password,
      loading,
      executePresets,
      modifyPresets,
      createPresets,
      createConfigs,
      isAdmin,
      isOriginal
    } = this.state

    const Cloud = () => {
      switch (saveState) {
        case 'Deleting':
        case 'Saving':
          return <CloudQueue />
        case 'Saved':
          return <CloudDone />
        default:
          return <CloudUpload />
      }
    }

    const isEditingUserAdmin = this.context.getUserPermission('isAdmin')

    return (
      <ValidatorForm
        className='user-editor-form'
        autoComplete='off'
        onSubmit={this.postUserData}
      >
        {!isEditingUserAdmin && (
          <div className='editor-header'>
            <Typography variant='h5'>Change your preferences:</Typography>
            <Divider />
          </div>
        )}
        <div className='editor-fieldsets'>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>User Preferences:</FormLabel>
            <FormGroup>
              <TextValidator
                variant='outlined'
                label='Username'
                value={username}
                required
                fullWidth
                validators={['notEmpty', 'wordBlacklist', 'minStringLength:3']}
                errorMessages={['This field cannot be empty!', 'This name is already taken!', 'The name needs to be at least 3 chars long!']}
                disabled={loading}
                onChange={this.onInputChange('username')}
              />
              <TextValidator
                variant='outlined'
                label={isNew ? 'Password' : 'Change Password'}
                type='password'
                value={isNew ? newPassword : password}
                validators={isNew ? ['notEmpty', 'minStringLength:3'] : []}
                errorMessages={isNew ? ['This field cannot be empty!', 'Password needs to be at least 3 chars long!'] : []}
                disabled={loading}
                required={isNew}
                fullWidth
                onChange={this.onInputChange(isNew ? 'newPassword' : 'password')}
              />
            </FormGroup>
          </FormControl>
          <FormControl component='fieldset'>
            <FormLabel
              component='legend'
              focused={false}
            >User Permissions:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox
                  checked={executePresets}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('executePresets')}
                />}
                label='Executing Presets'
                disabled
              />
              <FormControlLabel
                control={<Checkbox
                  checked={modifyPresets}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('modifyPresets')}
                />}
                disabled={loading || isAdmin || !isEditingUserAdmin}
                label='Modifying Presets'
              />
              <FormControlLabel
                control={<Checkbox
                  checked={createPresets}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('createPresets')}
                />}
                disabled={loading || isAdmin || !isEditingUserAdmin}
                label='Adding/Removing Presets'
              />
              <FormControlLabel
                control={<Checkbox
                  checked={createConfigs}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('createConfigs')}
                />}
                disabled={loading || isAdmin || !isEditingUserAdmin}
                label='Adding/Removing Configs'
              />
              <Tooltip
                placement='left'
                title={
                  isOriginal
                    ? 'This user is Owner and thus cannot have his permissions removed.'
                    : 'This right makes the user an admin, thus they also obtain every other right.'
                }
              >
                <FormControlLabel
                  control={<Checkbox
                    checked={isAdmin}
                    disabled={loading || isOriginal || !isEditingUserAdmin}
                    onChange={this.onInputChange('isAdmin')}
                  />}
                  label='Managing Users 👑'
                />
              </Tooltip>
            </FormGroup>
          </FormControl>
        </div>
        <div className='editor-submit'>
          <Divider />
          <Button
            type='submit'
            color='primary'
            variant={(saveState === 'Saved' || saveState === 'Deleting') ? 'outlined' : 'contained'}
            disabled={loading}
          >
            <Cloud />
            {saveState}
          </Button>
          {(!isOriginal && !isNew && isEditingUserAdmin) && (
            <Button
              disabled={loading}
              onClick={this.postDeleteUser}
            >
              <Delete />
              Remove User
            </Button>
          )}
        </div>
        <Prompt
          when={saveState === 'Save'}
          message={() => `You have unsaved changes. Are you sure you want to leave?`}
        />
      </ValidatorForm>
    )
  }
}

export default withSnackbar(UserEditor)
