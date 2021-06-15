/**
 * Custom collection
 */
const collection = "tasks"
const { Router } = require("express")

const BaseDAO = require('../BaseDAO')
const BaseController = require('../BaseController')


class CustomDAO extends BaseDAO {
    // Edit custom collection functions...

}

const customDAO = new CustomDAO(collection)

class CustomController extends BaseController {
    // Edit custom api calls...

}
const customController = new CustomController(customDAO)

const router = new Router()
router.route('/').get(customController.apiGetDocsList)
router.route('/').post(customController.apiAddDoc)
router.route('/').put(customController.apiUpdateDoc)
router.route('/').delete(customController.apiDeleteDoc)
router.route('/:_id').delete(customController.apiDeleteDoc)
router.route('/max/:field').get(customController.apiGetMax)
router.route('/exists/:field/:value').get(customController.apiExists)

module.exports = {
    dao: customDAO,
    url: `/api/${collection}`,
    router
}