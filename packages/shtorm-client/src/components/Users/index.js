import React, { Component, Fragment } from 'react'
import { Paper, Grid } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import UsersSelect from './UsersSelect'
import UsersList from './UsersList'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

function GridPaper ({ xs, sm, md, lg, xl, children }) {
  return (
    <Grid
      className='grid-split'
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
    >
      <Paper className='paper'>
        {children}
      </Paper>
    </Grid>
  )
}

GridPaper.propTypes = {
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  children: PropTypes.any
}

export default class Users extends Component {
  state = {
    loading: true
  }

  componentDidMount = () => {
    this.getAllUsers()
  }

  getAllUsers = () => {
    axios.get(Api.getApiUrl('getAllUsers'))
      .then((data) => {
        if (!Api.axiosCheckResponse(data)) throw new Error('An unexpected error happened!')
        console.log(data)
      })
      .catch(Api.axiosErrorHandler)
  }

  render () {
    const { loading } = this.state
    return (
      <Fragment>
        <GridPaper
          xs={12}
          sm={5}
          md={3}
          xl={2}
        >
          <UsersList loading={loading} />
        </GridPaper>
        <GridPaper
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <Switch>
            <Route
              path='/users/:id'
              component={UsersSelect}
            />
            <Route
              path='/users'
              component={UsersSelect}
            />
          </Switch>
        </GridPaper>
      </Fragment>
    )
  }
}
