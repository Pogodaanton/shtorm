import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import { withApi } from '../Api'
import { GridPaper } from '../DefaultGridItem'
import BotConfigList from './BotConfigList'
import PropTypes from 'prop-types'
import axios from 'axios'
import Loader from '../Loader'

const BotConfigEditor = Loader(import('./BotConfigEditor'))
const BotConfigSelect = Loader(import('./BotConfigSelect'), () => null)

class BotConfigs extends Component {
  static propTypes = {
    history: PropTypes.object,
    api: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    configList: []
  }

  componentDidMount = () => {
    this.getAllConfigs()
    BotConfigEditor.preload()
  }

  getAllConfigs = () => {
    axios.get(this.props.api.getApiUrl('getAllConfigs'), { withCredentials: true })
      .then((res) => {
        if (!this.props.api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          configList: res.data.data,
          loading: false
        })
      })
      .catch(this.props.api.axiosErrorHandler(false, this.props.history))
  }

  render () {
    const { loading, configList } = this.state
    return (
      <Fragment>
        <GridPaper
          className='grid-split'
          xs={12}
          sm={5}
          md={3}
          xl={2}
        >
          <BotConfigList
            loading={loading}
            list={configList}
          />
        </GridPaper>
        <GridPaper
          className='grid-split'
          xs={12}
          sm={7}
          md={8}
          lg={7}
        >
          <Switch>
            <Route
              path='/configs/:id'
              component={(props) => (
                <BotConfigEditor
                  {...props}
                  onReloadRequest={this.getAllConfigs}
                />
              )}
            />
            <Route
              path='/configs'
              component={BotConfigSelect}
            />
          </Switch>
        </GridPaper>
      </Fragment>
    )
  }
}

export default withApi(BotConfigs)
