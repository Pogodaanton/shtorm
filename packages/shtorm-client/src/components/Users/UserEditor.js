import React, { Component } from 'react'
import { Prompt } from 'react-router-dom'
import { withApi } from '../Api'
import { FormGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Button, Divider, Tooltip, Typography } from '@material-ui/core'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { CloudUpload, CloudQueue, CloudDone, Delete } from '@material-ui/icons'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import axios from 'axios'
import { UserContext } from '../../contexts/UserContext'
import '../EditorHelpers/EditorHelper.scss'

class UserEditor extends Component {
  static contextType = UserContext
  static propTypes = {
    onReloadRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func,
    api: PropTypes.object.isRequired
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
    executeProjects: true,
    assignProjects: false,
    seeAllProjects: false,
    createProjects: false,
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
    axios.get(this.props.api.getApiUrl('getAllUsernames'), { withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.nameList = res.data.data.map(({ username }) => username)
      })
      .catch(this.props.api.axiosErrorHandler(true))
  }

  getUserData = (id) => {
    axios.get(this.props.api.getApiUrl('getUser'), { params: { id }, withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          loading: false,
          ...res.data.data
        }, this.setOrigState)
      })
      .catch((err) => {
        this.props.api.axiosErrorHandler(true)(err)
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
      assignProjects,
      seeAllProjects,
      createProjects,
      createConfigs
    } = this.state

    this.setState({
      saveState: 'Saving',
      loading: true
    }, () => {
      axios.post(this.props.api.getApiUrl('saveUser'), {
        id,
        username,
        password: password || newPassword,
        isAdmin,
        assignProjects,
        seeAllProjects,
        createProjects,
        createConfigs
      }, { withCredentials: true })
        .then((res) => {
          if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')

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
          this.props.api.axiosErrorHandler(true)(err)
        })
    })
  }

  postDeleteUser = () => {
    const { id } = this.state

    this.setState({
      saveState: 'Deleting',
      loading: true
    }, () => {
      axios.post(this.props.api.getApiUrl('deleteUser'), { id }, { withCredentials: true })
        .then((res) => {
          this.props.onReloadRequest()
          this.props.history.replace('/users')
        })
        .catch((err) => {
          this.setState({ saveState: 'Save', loading: false })
          this.props.api.axiosErrorHandler(true)(err)
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
      executeProjects,
      assignProjects,
      seeAllProjects,
      createProjects,
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
        className='editor-form'
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
                  checked={executeProjects}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('executeProjects')}
                />}
                label='Executing Projects'
                disabled
              />
              <FormControlLabel
                control={<Checkbox
                  checked={createProjects || assignProjects}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('createProjects')}
                />}
                disabled={loading || isAdmin || !isEditingUserAdmin || assignProjects}
                label='Adding/Removing Projects'
              />
              <Tooltip
                placement='left'
                title={
                  isEditingUserAdmin
                    ? 'This user will have access to all usernames in the database.'
                    : ''
                }
              >
                <FormControlLabel
                  control={<Checkbox
                    checked={assignProjects}
                    indeterminate={isAdmin}
                    onChange={this.onInputChange('assignProjects')}
                  />}
                  disabled={loading || isAdmin || !isEditingUserAdmin}
                  label='Assigning Projects to Users'
                />
              </Tooltip>
              <FormControlLabel
                control={<Checkbox
                  checked={seeAllProjects}
                  indeterminate={isAdmin}
                  onChange={this.onInputChange('seeAllProjects')}
                />}
                disabled={loading || isAdmin || !isEditingUserAdmin}
                label='Access to all Projects'
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
                  isEditingUserAdmin
                    ? isOriginal
                      ? 'This user is Owner and thus cannot have his permissions removed.'
                      : 'This right makes the user an admin, thus they also obtain every other right.'
                    : ''
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

export default withApi(UserEditor)
