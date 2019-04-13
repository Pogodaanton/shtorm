import configController from './configController'

class ScriptController {
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

  getAllScripts = () => {
    return ['Mum', 'Gae', 'Boi', 'Wut']
  }
}

const scriptController = new ScriptController()
export default scriptController
