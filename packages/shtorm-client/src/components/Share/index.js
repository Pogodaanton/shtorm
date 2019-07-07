import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import RouteDialog from '../RouteDialog'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Paper,
  MenuItem,
  Divider
} from '@material-ui/core'
import { Send } from '@material-ui/icons'
import { UserContext } from '../../contexts/UserContext'
import { withApi } from '../Api'
import axios from 'axios'
import Downshift from 'downshift'
import deburr from 'lodash.deburr'
import find from 'lodash.find'
import './Share.scss'

/**
 * Taken from Material-UI doc and slightly modified it:
 * https://material-ui.com/components/autocomplete/
 */
const renderSuggestion = (suggestionProps) => {
  const { suggestion, index, itemProps, highlightedIndex, selectedItem } = suggestionProps
  const isHighlighted = highlightedIndex === index
  const isSelected = (selectedItem || '').indexOf(suggestion.username) > -1

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.id}
      selected={isHighlighted}
      component='div'
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.username}
    </MenuItem>
  )
}

renderSuggestion.propTypes = {
  highlightedIndex: PropTypes.number,
  index: PropTypes.number,
  itemProps: PropTypes.object,
  selectedItem: PropTypes.string,
  suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired
}

class Share extends Component {
  static contextType = UserContext
  static propTypes = {
    api: PropTypes.object.isRequired,
    match: PropTypes.any.isRequired,
    history: PropTypes.any.isRequired
  }

  allUsers: []
  state = {
    open: true,
    loading: true,
    project: {},
    assignees: []
  }

  componentDidMount = () => this.getAllAssignees()

  getAllAssignees = () => {
    const { api, match, history } = this.props
    const { id } = match.params

    axios.all([
      axios.get(api.getApiUrl('getAllUsernames'), { withCredentials: true }),
      axios.get(api.getApiUrl('getAllProjectAssignees'), { params: { id }, withCredentials: true })
    ])
      .then(axios.spread((resOne, resTwo) => {
        if (api.axiosCheckResponse(resOne) && api.axiosCheckResponse(resTwo)) {
          this.allUsers = resOne.data.data
          const { assignees, project } = resTwo.data.data
          this.setState({ assignees, project, loading: false })
        }
      }))
      .catch(api.axiosErrorHandler(true, history))
  }

  postSetAssignee = (user, shouldDelete = false) => {
    const { api, match } = this.props
    const { id } = match.params

    axios.post(api.getApiUrl(`${shouldDelete ? 'delete' : 'add'}ProjectAssignee`), { id, user }, { withCredentials: true })
      .then((res) => {
        const { assignees } = this.state
        if (shouldDelete) assignees.splice(assignees.findIndex((assignee) => assignee.id === user.id), 1)
        else assignees.push(user)
        this.setState({ assignees })
      })
      .catch(api.axiosErrorHandler(true))
  }

  /**
   * Taken from Material-UI doc:
   */
  getSuggestions = (value, { showEmpty = false } = {}) => {
    const inputValue = deburr(value.trim()).toLowerCase()
    const inputLength = inputValue.length
    let count = 0

    return inputLength === 0 && !showEmpty
      ? []
      : this.allUsers.filter(({ username }) => {
        const keep = (
          count < 5 &&
          deburr(username).slice(0, inputLength).toLowerCase() === inputValue &&
          username !== this.context.currentUser.username &&
          this.state.assignees.findIndex(({ username: assigneeName }) => assigneeName === username) < 0
        )
        if (keep) count += 1
        return keep
      })
  }

  onInputChange = (name) => ({ target }) => this.setState({ [name]: target.value })
  onButtonPress = (action, customValue = '') => (e) => {
    const value = customValue || e.target.value
    const { assignees } = this.state
    e.preventDefault()
    switch (action) {
      case 'add':
        const user = find(this.allUsers, { username: value })
        if (user && assignees.findIndex((val) => val.id === user.id) === -1) this.postSetAssignee(user, false)
        break
      case 'delete':
        this.postSetAssignee(value, true)
        break
      case 'close':
        this.setState({ open: false })
        break
      default:
        break
    }
  }

  render () {
    const { open, loading, project, assignees } = this.state
    return (
      <RouteDialog
        history={this.props.history}
        open={open}
        className='project-share-dialog'
        aria-labelledby='psd-title'
        maxWidth='md'
        fullWidth
      >
        <DialogTitle id='psd-title'>
          Share Project{project.name ? `: ${project.name}` : '...'}
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Fragment>
              <CircularProgress style={{ marginRight: 15 }} />Preparing some stuff...
            </Fragment>
          ) : (
            <Fragment>
              <DialogContentText>Grant access to this project by typing in the desired username or remove a user by clicking on its chip in the list.</DialogContentText>
              <Downshift id='downshift-simple'>
                {({
                  getInputProps,
                  getItemProps,
                  getLabelProps,
                  getMenuProps,
                  highlightedIndex,
                  inputValue,
                  isOpen,
                  selectedItem
                }) => {
                  const { onBlur, onFocus, ref, ...inputProps } = getInputProps({
                    placeholder: 'Search for a username'
                  })

                  return (
                    <form
                      className='psd-add'
                      onSubmit={this.onButtonPress('add', inputValue)}
                    >
                      <TextField
                        label='Username'
                        InputProps={{ onBlur, onFocus, inputRef: ref }}
                        InputLabelProps={getLabelProps({ shrink: true })}
                        className='psd-add-input'
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        {...inputProps}
                      />

                      <div {...getMenuProps()}>
                        {isOpen ? (
                          <Paper
                            className='psd-add-autocomplete-paper'
                            square
                          >
                            {this.getSuggestions(inputValue).map((suggestion, index) =>
                              renderSuggestion({
                                suggestion,
                                index,
                                itemProps: getItemProps({ item: suggestion.username }),
                                highlightedIndex,
                                selectedItem
                              })
                            )}
                          </Paper>
                        ) : null}
                      </div>
                      <Button
                        type='submit'
                        margin='dense'
                        variant='contained'
                        color='secondary'
                      >
                        <Send />
                      </Button>
                    </form>
                  )
                }}
              </Downshift>
              <Divider />
              <div className='psd-chip-pool'>
                {assignees.map((user) => {
                  const { id, username, isAdmin } = user
                  const isThisUser = user.id === this.context.currentUser.id
                  return (
                    <Chip
                      key={id}
                      avatar={<Avatar>{username.charAt(0).toUpperCase()}</Avatar>}
                      label={username}
                      variant={isAdmin ? 'default' : 'outlined'}
                      color={isAdmin ? 'secondary' : 'default'}
                      onDelete={isThisUser ? null : this.onButtonPress('delete', user)}
                      onClick={isThisUser ? () => null : this.onButtonPress('delete', user)}
                      clickable={!isThisUser}
                    />
                  )
                })}
              </div>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color='primary'
            onClick={this.onButtonPress('close')}
          >
            Dismiss
          </Button>
        </DialogActions>
      </RouteDialog>
    )
  }
}

export default withApi(Share)
