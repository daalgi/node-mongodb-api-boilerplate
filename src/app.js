const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const helmet = require("helmet")
const { routes } = require("./routes")

const app = express()

// MIDDLEWARES
app.use(cors())
// Prevent putting this page in an iframesunless it's on the same origin
app.use(helmet.frameguard({ action: 'sameorigin' }))
// Do not allow DNS prefetching
app.use(helmet.dnsPrefetchControl())
// Only allow your site to send the referrer for your own pages
app.use(helmet.referrerPolicy({ policy: 'same-origin' }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Test route
app.get("/", (req, res) => {
    let result = { message: "Hello from the server!" }
    console.log(result)
    res.json(result)
})

// Register api routes
routes.forEach(({ url, router }) =>
    app.use(url, router)
)

app.use("*", (req, res) =>
    res.status(404).json({ error: "not found" })
)

module.exports = app