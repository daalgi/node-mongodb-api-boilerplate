const exposeCollection = require("./db/exposeCollection")

// Load the custom defined collections here...
const tasks = require("./db/collections/tasks")

// Load the custom collections,
// defined with the corresponding DAOs and routers
// within `./db/collections/`
// Insert the objects here...
const customCollections = [
    tasks
]

// Arrays to be exported
const daos = []
const routes = []

// Fill the arrays with the `customCollections`
customCollections.forEach(collection => {
    daos.push(collection.dao)
    routes.push({ 
        url: collection.url, 
        router: collection.router 
    })
})

// Array containing the name of default collections,
// Insert the names here...
const defaultCollections = [
    "projects",
    "machines",
    "anchorcages",
    "clients"
]

// Fill the arrays with the `defaultCollections`
defaultCollections.forEach(collection => {
    obj = exposeCollection({ name: collection })
    daos.push(obj.dao)
    routes.push({
        url: obj.url,
        router: obj.router
    })
})

module.exports = {
    routes,
    daos
}