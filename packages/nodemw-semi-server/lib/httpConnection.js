import { Router } from 'express'
import configController from './Controllers/configController'

const router = Router()
router.get('/api/v1/ping', configController.requestPong)
router.get('/api/v1/getConfig', configController.requestConfig)
router.get('/api/v1/getAllConfigs', configController.requestAllConfigs)
router.post('/api/v1/saveConfig', configController.requestSaveConfig)
router.post('/api/v1/deleteConfig', configController.requestDeleteConfig)

export default router
