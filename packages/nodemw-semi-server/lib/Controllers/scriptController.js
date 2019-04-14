import configController from './configController'

class ScriptController {
  requestScriptOptions = (req, res) => {
    const data = this.getScriptOptions(req.query.name)
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'Script options successfully requested.',
        data
      })
    } else {
      return res.status(410).send({
        success: false,
        message: 'The requested script was not found!'
      })
    }
  }

  requestAllScripts = (req, res) => {
    return res.status(200).send({
      success: true,
      message: 'Scripts and configs successfully requested.',
      data: {
        scripts: this.getAllScripts(),
        configs: configController.getAllConfigs()
      }
    })
  }

  getScriptOptions = (scriptName) => {
    return []
  }

  getAllScripts = () => {
    return ['Mum', 'Gae', 'Boi', 'Wut']
  }
}

const scriptController = new ScriptController()
export default scriptController
