import { Router } from 'express'
import passport from 'passport'
import configController, { validateConfig } from './Controllers/configController'
import projectController, { validateProject } from './Controllers/projectController'
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

// Projects
router.get(getPath('getAllProjects'), validateUser('executeProjects'), validationHandler, projectController.requestAllProjects)
router.get(getPath('getProject'), validateProject('getProject'), validationHandler, projectController.requestProject)
router.post(getPath('deleteProject'), validateProject('deleteProject'), validationHandler, projectController.requestDeleteProject)
router.post(getPath('saveProject'), validateProject('saveProject'), validationHandler, projectController.requestSaveProject)
router.get(getPath('getAllProjectAssignees'), validateProject('getAllProjectAssignees'), validationHandler, projectController.requestAllProjectAssignees)
router.post(getPath('addProjectAssignee'), validateProject('setProjectAssignee'), validationHandler, projectController.requestSetAssignee(false))
router.post(getPath('deleteProjectAssignee'), validateProject('setProjectAssignee'), validationHandler, projectController.requestSetAssignee(true))

// Scripts
router.get(getPath('getAllScripts'), validateUser('executeProjects'), validationHandler, scriptConfigController.requestAllScripts)
router.get(getPath('getScriptOptions'), validateUser('executeProjects'), validationHandler, scriptConfigController.requestScriptOptions)
router.get(getPath('getCustomScriptOptions'), validateUser('executeProjects'), validationHandler, scriptConfigController.requestCustomScriptOptions)

// Users
router.get(getPath('getAllUsers'), validateUser('admin'), validationHandler, userController.requestAllUsers)
router.get(getPath('getAllUsernames'), validateUser('assignProject'), validationHandler, userController.requestAllUsernames)
router.get(getPath('getUser'), validateUser('getUser'), validationHandler, userController.requestUser)
router.post(getPath('saveUser'), validateUser('saveUser'), validationHandler, userController.requestSaveUser)
router.post(getPath('deleteUser'), validateUser('deleteUser'), validationHandler, userController.requestDeleteUser)

// Authentication
userController.configurePassport(passport)
router.post(getPath('logIn'), userController.requestLogin(passport))
router.get(getPath('logOut'), validateUser('executeProjects'), validationHandler, userController.requestLogout(passport))
router.get(getPath('whoami'), userController.requestCurrentUser)

export default router
