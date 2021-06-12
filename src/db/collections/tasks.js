/**
 * Custom collection
 */
const { Router } = require("express")

const BaseDAO = require('../BaseDAO')
const BaseController = require('../BaseController')


class TasksDAO extends BaseDAO {

}

const tasksDAO = new TasksDAO("tasks")

const tasksController = new BaseController(tasksDAO)

const router = new Router()
router.route('/').get(tasksController.apiGetDocsList)
router.route('/').post(tasksController.apiAddDoc)
router.route('/').put(tasksController.apiUpdateDoc)
router.route('/').delete(tasksController.apiDeleteDoc)
router.route('/:_id').delete(tasksController.apiDeleteDoc)
router.route('/max/:field').get(tasksController.apiGetMax)
router.route('/exists/:field/:value').get(tasksController.apiExists)

module.exports = {
    dao: tasksDAO,
    url: '/api/tasks',
    router
}