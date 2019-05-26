import { Router } from 'express'
import configController from './Controllers/configController'
import presetController from './Controllers/presetController'
import scriptConfigController from './Controllers/scriptConfigController'
import userController from './Controllers/userController'

const router = Router()

// Configs
router.get('/api/v1/getConfig', configController.requestConfig)
router.get('/api/v1/getAllConfigs', configController.requestAllConfigs)
router.post('/api/v1/saveConfig', configController.requestSaveConfig)
router.post('/api/v1/deleteConfig', configController.requestDeleteConfig)

// Presets
router.get('/api/v1/getAllPresets', presetController.requestAllPresets)
router.get('/api/v1/getPreset', presetController.requestPreset)
router.post('/api/v1/deletePreset', presetController.requestDeletePreset)
router.post('/api/v1/savePreset', presetController.requestSavePreset)

// Scripts
router.get('/api/v1/getAllScripts', scriptConfigController.requestAllScripts)
router.get('/api/v1/getScriptOptions', scriptConfigController.requestScriptOptions)

// Users
router.get('/api/v1/getAllUsers', userController.requestAllUsers)
router.get('/api/v1/getAllUsernames', userController.requestAllUsernames)
router.get('/api/v1/getUser', userController.requestUser)
router.post('/api/v1/saveUser', userController.requestSaveUser)
router.post('/api/v1/deleteUser', userController.requestDeleteUser)

export default router
