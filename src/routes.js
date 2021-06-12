const exposeCollection = require("./db/exposeCollection")

// Load the custom defined collections here...
const tasks = require("./db/collections/tasks")

// Load the custom collections,
// defined with the corresponding DAOs and routes
// Insert the objects here...
const daos = [
    tasks.dao
]

const routes = [
    { url: tasks.url, router: tasks.router }
]

// Array containing the name of default collections,
// Edit here...
const collections = [
    // "tasks",
    "machines",
    "anchorcages"
]

// Create DAOs and routes for each default collection
collections.forEach(collection => {
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