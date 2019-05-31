import { Router } from 'express'
import passport from 'passport'
import configController from './Controllers/configController'
import presetController from './Controllers/presetController'
import scriptConfigController from './Controllers/scriptConfigController'
import userController, { validate, validationHandler } from './Controllers/userController'

const router = Router()
const getPath = (suffix) => `/api/v1/${suffix}`

// Configs
router.get(getPath('getConfig'), validate('createConfigs'), validationHandler, configController.requestConfig)
router.get(getPath('getAllConfigs'), validate('viewConfigs'), validationHandler, configController.requestAllConfigs)
router.post(getPath('saveConfig'), validate('createConfigs'), validationHandler, configController.requestSaveConfig)
router.post(getPath('deleteConfig'), validate('createConfigs'), validationHandler, configController.requestDeleteConfig)

// Presets
router.get(getPath('getAllPresets'), validate('executePresets'), validationHandler, presetController.requestAllPresets)
router.get(getPath('getPreset'), validate('executePresets'), validationHandler, presetController.requestPreset)
router.post(getPath('deletePreset'), validate('createPresets'), validationHandler, presetController.requestDeletePreset)
router.post(getPath('savePreset'), validate('createPresets'), validationHandler, presetController.requestSavePreset)

// Scripts
router.get(getPath('getAllScripts'), validate('executePresets'), validationHandler, scriptConfigController.requestAllScripts)
router.get(getPath('getScriptOptions'), validate('executePresets'), validationHandler, scriptConfigController.requestScriptOptions)

// Users
router.get(getPath('getAllUsers'), validate('admin'), validationHandler, userController.requestAllUsers)
router.get(getPath('getAllUsernames'), validate('admin'), validationHandler, userController.requestAllUsernames)
router.get(getPath('getUser'), validate('getUser'), validationHandler, userController.requestUser)
router.post(getPath('saveUser'), validate('saveUser'), validationHandler, userController.requestSaveUser)
router.post(getPath('deleteUser'), validate('deleteUser'), validationHandler, userController.requestDeleteUser)

// Authentication
userController.configurePassport(passport)
router.post(getPath('logIn'), userController.requestLogin(passport))
router.get(getPath('logOut'), validate('executePresets'), validationHandler, userController.requestLogout(passport))
router.get(getPath('getLoginInformation'), userController.requestCurrentUser)

export default router
