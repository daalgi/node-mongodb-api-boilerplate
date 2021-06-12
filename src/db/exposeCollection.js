const { Router } = require("express")

const BaseDAO = require("./BaseDAO")
const BaseController = require("./BaseController")

const exposeCollection = ({name, apiPrefix="/api"}) => {
    const dao = new BaseDAO(name)
    const controller = new BaseController(dao)
    
    const router = new Router()
    router.route('/').get(controller.apiGetDocsList)
    router.route('/').post(controller.apiAddDoc)    
    router.route('/').put(controller.apiUpdateDoc)    
    router.route('/').delete(controller.apiDeleteDoc)
    router.route('/:_id').delete(controller.apiDeleteDoc)    
    router.route('/max/:field').get(controller.apiGetMax)
    router.route('/exists/:field/:value').get(controller.apiExists)

    const res = { dao, url: `${apiPrefix}/${name}`, router: router }
    // console.log(res)
    return res
}

module.exports = exposeCollection