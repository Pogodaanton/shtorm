import { Router } from 'express'
import configController from './Controllers/configController'

const router = Router()
router.get('/api/v1/ping', configController.requestPong)
router.get('/api/v1/getConfig', configController.requestConfig)
router.get('/api/v1/getAllConfigs', configController.requestAllConfigs)

export default router
