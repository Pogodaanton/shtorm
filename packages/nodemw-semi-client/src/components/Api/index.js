import config from '../../config.json'

class Api {
  axiosErrorHandler (err) {
    let errMsg = err.toString()
    if (typeof err.response !== 'undefined' && typeof err.response.data !== 'undefined' && typeof err.response.data.message !== 'undefined') {
      errMsg = err.response.data.message
    }

    /*
    this.setState({
      snackbar: {
        msg: errMsg + ' - See console for more info!',
        isOpen: true
      }
    })
    setTimeout(() => this.setState({ snackbar: { msg: this.state.snackbar.msg, isOpen: false } }), 10000)
    */

    console.log(errMsg)
  }

  getApiUrl (controller) {
    return `${config.prefix}${config.socketAdress}${config.apiAdress}${controller}`
  }
}

export default new Api()
