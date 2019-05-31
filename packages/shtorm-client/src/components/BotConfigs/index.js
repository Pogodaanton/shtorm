import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import { withSnackbar } from 'notistack'
import { GridPaper } from '../DefaultGridItem'
import BotConfigSelect from './BotConfigSelect'
import BotConfigList from './BotConfigList'
import BotConfigEditor from './BotConfigEditor'
import PropTypes from 'prop-types'
import axios from 'axios'
import Api from '../Api'

class BotConfigs extends Component {
  static propTypes = {
    enqueueSnackbar: PropTypes.func,
    closeSnackbar: PropTypes.func,
    history: PropTypes.object
  }

  state = {
    loading: true,
    configList: []
  }

  componentDidMount = () => {
    this.getAllConfigs()
  }

  getAllConfigs = () => {
    axios.get(Api.getApiUrl('getAllConfigs'), { withCredentials: true })
      .then((res) => {
        if (!Api.axiosCheckResponse(res)) throw new Error('Wrong result received!')
        this.setState({
          configList: res.data.data,
          loading: false
        })
      })
      .catch(Api.axiosErrorHandlerNotify(this.props.enqueueSnackbar, this.props.closeSnackbar, this.props.history))
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

export default withSnackbar(BotConfigs)
