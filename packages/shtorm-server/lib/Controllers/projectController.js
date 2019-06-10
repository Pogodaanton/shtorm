import DatabaseController from './databaseController'
import userController, { validateUser, permission } from './userController'
import { check } from 'express-validator/check'
import scriptConfigController from './scriptConfigController'
import configController from './configController'
import shortid from 'shortid'

const db = DatabaseController.getDatabase('projects')

export const validateProject = (type) => {
  switch (type) {
    case 'getProject':
      return [
        ...validateUser('executeProjects'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
      ]
    case 'saveProject':
      return [
        ...validateUser('createProjects'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => shortid.isValid(id) || id === 'add')
          .withMessage('ID does not seem to be in the right format!')
          .custom((id) => {
            if (id !== 'add') {
              const existingProject = db.find({ id }).value()
              if (!existingProject) return false
            }
            return true
          })
          .withMessage('Project was not found in database!'),
        check('name')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('Name is required!')
          .isString()
          .withMessage('Name must be a string!')
          .isLength({ min: 3 })
          .withMessage('Name needs to be at least 3 chars long!'),
        check('config')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('Config ID is required!')
          .isString()
          .withMessage('Config ID must be a string!')
          .custom((id) => shortid.isValid(id))
          .withMessage('Config ID does not seem to be in the right format!')
          .custom((id) => {
            const existingProject = configController.getConfig(id)
            if (!existingProject) return false
            return true
          })
          .withMessage('Given config does not exist!')
      ]
    case 'deleteProject':
      return [
        ...validateUser('createProjects'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => {
            const existingProject = db.find({ id }).value()
            if (!existingProject) throw new Error('Project was not found in database!')
            return true
          })
      ]
    case 'getAllProjectAssignees':
      return [
        ...validateUser('assignProjects'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => {
            const existingProject = db.find({ id }).value()
            if (!existingProject) throw new Error('Project was not found in database!')
            return true
          })
      ]
    case 'setProjectAssignee':
      return [
        ...validateUser('assignProjects'),
        check('id')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('ID is required!')
          .isString()
          .withMessage('ID must be a string!')
          .custom((id) => {
            const existingProject = db.find({ id }).value()
            if (!existingProject) throw new Error('Project was not found in database!')
            return true
          }),
        check('user')
          .exists({ checkFalsy: true, checkNull: true })
          .withMessage('User is required!')
          .custom(({ id }, { req }) => {
            if (id === req.user.id) throw new Error('User cannot remove itself from the list!')
            return true
          })
      ]
    default:
      return []
  }
}

class ProjectController {
  requestProject = (req, res) => {
    const data = this.getProject(req.query.id).project
    if (data) {
      return res.status(200).send({
        success: true,
        message: 'Project successfully requested.',
        data
      })
    } else {
      return res.status(400).send({
        success: false,
        message: 'Project was not found in Database.'
      })
    }
  }

  requestAllProjects = (req, res) => {
    const canUserSeeAllProjects = permission.has('seeAllProjects', req)
    const canUserCreateProjects = permission.has('createProjects', req)

    return res.status(200).send({
      success: true,
      message: 'Projects successfully requested.',
      data: {
        projects: canUserSeeAllProjects ? this.getAllProjects() : this.getAllUserProjects(req.user.id),
        scripts: canUserCreateProjects ? scriptConfigController.getAllScripts() : []
      }
    })
  }

  requestSaveProject = (req, res) => {
    let { id, name, script, config: configId, scriptOptions } = req.body

    if (id === 'add') {
      const newId = shortid.generate()
      db.push({
        id: newId,
        name,
        script,
        config: configId,
        origin: req.user.id,
        scriptOptions
      }).write()

      userController.setProjectAssignee(newId, req.user)
      return res.status(201).send({
        success: true,
        message: 'Project successfully added!',
        newId
      })
    }

    const existingProject = db.find({ id })
    existingProject.assign({
      name,
      script,
      config: configId,
      scriptOptions
    }).write()

    return res.status(201).send({
      success: true,
      message: 'Project successfully saved!',
      data: req.body
    })
  }

  requestDeleteProject = (req, res) => {
    const { id } = req.body
    db.remove({ id }).write()

    return res.status(201).send({
      success: true,
      message: 'Project successfully removed!'
    })
  }

  requestAllProjectAssignees = (req, res) => {
    const { id } = req.query
    const assignees = userController.getAllProjectAssignees(id)
    const project = this.getProject(id).project

    return res.status(200).send({
      success: true,
      message: 'Project assignees successfully requested!',
      data: { assignees, project }
    })
  }

  requestSetAssignee = (shouldDelete) => (req, res) => {
    const { id, user } = req.body
    userController.setProjectAssignee(id, user, shouldDelete)

    return res.status(200).send({
      success: true,
      message: 'Project assignee status successfully changed!'
    })
  }

  getAllProjects = () => {
    return this.formatAllProjects(db).value()
  }

  getAllUserProjects = (userId = '') => {
    const user = userController.getUser(userId)
    const assignments = new Set(user.assignments)

    return this.formatAllProjects(db.filter(({ id }) => assignments.has(id))).value()
  }

  formatAllProjects = (projects = []) => {
    return projects.map(({ id, name, script, config: configId, origin: originId }) => {
      const configObj = configController.getConfig(configId) || {}
      const userObj = userController.getUser(originId) || {}
      let favicon = configController.getFavicon(configObj.server || '404')
      let config = configObj.name || 'DELETED'
      let origin = userObj.username || 'DELETED'

      return {
        favicon,
        id,
        name,
        script,
        origin,
        config
      }
    })
  }

  getProject = (id = '') => {
    let project = db.find({ id }).value()
    let config = null
    if (id && project) {
      config = configController.getConfig(project.config)
    }

    return { project, config }
  }
}

const projectController = new ProjectController()
export default projectController
