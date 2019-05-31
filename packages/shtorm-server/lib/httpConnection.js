import { Router } from 'express'
import passport from 'passport'
import configController, { validateConfig } from './Controllers/configController'
import presetController from './Controllers/presetController'
import scriptConfigController from './Controllers/scriptConfigController'
import userController, { validateUser, validationHandler } from './Controllers/userController'

const router = Router()
const getPath = (suffix) => `/api/v1/${suffix}`

// Configs
router.get(getPath('getConfig'), validateConfig('getConfig'), validationHandler, configController.requestConfig)
router.get(getPath('getAllConfigs'), validateUser('createConfigs'), validationHandler, configController.requestAllConfigs)
router.get(getPath('getAllConfigNames'), validateUser('createConfigs'), validationHandler, configController.requestAllConfigNames)
router.post(getPath('saveConfig'), validateConfig('saveConfig'), validationHandler, configController.requestSaveConfig)
router.post(getPath('deleteConfig'), validateConfig('deleteConfig'), validationHandler, configController.requestDeleteConfig)

// Presets
router.get(getPath('getAllPresets'), validateUser('executePresets'), validationHandler, presetController.requestAllPresets)
router.get(getPath('getPreset'), validateUser('executePresets'), validationHandler, presetController.requestPreset)
router.post(getPath('deletePreset'), validateUser('createPresets'), validationHandler, presetController.requestDeletePreset)
router.post(getPath('savePreset'), validateUser('createPresets'), validationHandler, presetController.requestSavePreset)

// Scripts
router.get(getPath('getAllScripts'), validateUser('executePresets'), validationHandler, scriptConfigController.requestAllScripts)
router.get(getPath('getScriptOptions'), validateUser('executePresets'), validationHandler, scriptConfigController.requestScriptOptions)

// Users
router.get(getPath('getAllUsers'), validateUser('admin'), validationHandler, userController.requestAllUsers)
router.get(getPath('getAllUsernames'), validateUser('admin'), validationHandler, userController.requestAllUsernames)
router.get(getPath('getUser'), validateUser('getUser'), validationHandler, userController.requestUser)
router.post(getPath('saveUser'), validateUser('saveUser'), validationHandler, userController.requestSaveUser)
router.post(getPath('deleteUser'), validateUser('deleteUser'), validationHandler, userController.requestDeleteUser)

// Authentication
userController.configurePassport(passport)
router.post(getPath('logIn'), userController.requestLogin(passport))
router.get(getPath('logOut'), validateUser('executePresets'), validationHandler, userController.requestLogout(passport))
router.get(getPath('getLoginInformation'), userController.requestCurrentUser)

export default router
