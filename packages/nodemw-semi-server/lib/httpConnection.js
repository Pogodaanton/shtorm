import { Router } from 'express'
import configController from './Controllers/configController'
import presetController from './Controllers/presetController'
import scriptController from './Controllers/scriptController'

const router = Router()

// Configs
router.get('/api/v1/getConfig', configController.requestConfig)
router.get('/api/v1/getAllConfigs', configController.requestAllConfigs)
router.post('/api/v1/saveConfig', configController.requestSaveConfig)
router.post('/api/v1/deleteConfig', configController.requestDeleteConfig)

// Presets
router.get('/api/v1/getAllPresets', presetController.requestAllPresets)

// Scripts
router.get('/api/v1/getAllScripts', scriptController.requestAllScripts)

export default router
