import { Router } from 'express'
import passport from 'passport'
import configController from './Controllers/configController'
import presetController from './Controllers/presetController'
import scriptConfigController from './Controllers/scriptConfigController'
import userController from './Controllers/userController'

const router = Router()
const getPath = (suffix) => `/api/v1/${suffix}`

// Configs
router.get(getPath('getConfig'), configController.requestConfig)
router.get(getPath('getAllConfigs'), configController.requestAllConfigs)
router.post(getPath('saveConfig'), configController.requestSaveConfig)
router.post(getPath('deleteConfig'), configController.requestDeleteConfig)

// Presets
router.get(getPath('getAllPresets'), presetController.requestAllPresets)
router.get(getPath('getPreset'), presetController.requestPreset)
router.post(getPath('deletePreset'), presetController.requestDeletePreset)
router.post(getPath('savePreset'), presetController.requestSavePreset)

// Scripts
router.get(getPath('getAllScripts'), scriptConfigController.requestAllScripts)
router.get(getPath('getScriptOptions'), scriptConfigController.requestScriptOptions)

// Users
router.get(getPath('getAllUsers'), userController.requestAllUsers)
router.get(getPath('getAllUsernames'), userController.requestAllUsernames)
router.get(getPath('getUser'), userController.requestUser)
router.post(getPath('saveUser'), userController.requestSaveUserChecks, userController.requestSaveUser)
router.post(getPath('deleteUser'), userController.requestDeleteUserChecks, userController.requestDeleteUser)

// Authentication
userController.configurePassport(passport)
// router.post(getPath('logIn', userController.requestLoginChecks, userController.requestLogin)
router.post(getPath('logIn'), userController.requestLogin(passport))
router.get(getPath('logOut'), userController.requestLogout(passport))

export default router
