const cors = require('cors')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const { MongoClient } = require("mongodb")
const app = require("./app")
const { daos } = require("./routes")

// Setup variables
require("dotenv").config()
const hostname = process.env.NODE_ENV === "prod"
    ? process.env.HOSTNAME
    : process.env.HOSTNAME_LOCAL
const port = process.env.NODE_ENV === "prod"
    ? process.env.PORT || 5000
    : process.env.PORT_LOCAL || 5000
const dbUri = process.env.DB_LOCAL === 'true'
    ? process.env.DB_LOCAL_URI
    : process.env.DB_ATLAS_URI

// MongoDB connection
const connectionOptions = {
    useNewUrlParser: true,
    poolSize: 50,
    // wtimeout: 2500,
    useUnifiedTopology: true
}

//console.log(dbUri)
MongoClient
    .connect(dbUri, connectionOptions)
    .catch(err => {
        console.error(err.stack)
        process.exit(1)
    })
    .then(async connection => {
        // Inject all the collections in the database
        try {
            daos.forEach(async (dao) => await dao.injectDB(connection))
            //console.log(ClientsDAO.collectionName)
            app.listen(port, () => {
                console.log(`Server running at http://${hostname}:${port}/`)
            })
        } catch (e) {
            console.log(e)
        }
    })

// app.listen(port, () => {
//     console.log(`Server running at http://${hostname}:${port}/`)
// })