const _ = require("lodash")
const BaseDAO = require("./BaseDAO")


/**
 * Parent class to be extended for the API controllers of the app
 * BaseController.itemDAO = undefined  // to be defined in the child classes
 * BaseController.prepareDocObject // can be overwritten in the child classes
 * NOT WORKING YET!!!
 */
class BaseController {

    constructor(itemDAO) {
        this.itemDAO = itemDAO
    }

    apiAddDoc = async (req, res, next) => {
        try {

            //let doc = this.prepareDocObject(req)
            let { doc, uniqueFields } = req.body
            //console.log(doc)
            if (doc.error)
                return res.status(400).json({ error: doc.error })

            if (uniqueFields) {
                const ufCheck = await this.itemDAO.exists(uniqueFields)
                if (ufCheck.exists)
                    return res.status(400).json({
                        error: "Document with the unique fields already exists"
                    })
            }
            //console.log(this.itemDAO)
            // Add the document to the collection
            const addedDoc = await this.itemDAO.add(doc)
            //console.log(addedDoc)
            if (addedDoc.error)
                return res.status(400).json({ error: addedDoc.error })

            res.json({ status: "success", doc: addedDoc.ops[0] })

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: e })
        }
    }

    apiDeleteDoc = async (req, res, next) => {
        try {

            // Document sent
            let doc = req.body

            // Parameters in the url
            let { _id } = req.params

            if (doc.error && !_id && !id)
                return res.status(400).json({ error: doc.error })

            // The parameter has preference
            // If there's no parameter, use the document
            if (!_id)
                _id = doc._id

            // If there's no _id, send error
            if (!_id)
                return res.status(400).json({ error: "Must provide an _id" })

            // Add the document to the collection
            const deletedDoc = await this.itemDAO.deleteById(_id)
            
            if (deletedDoc.error)
                return res.status(400).json({ error: deletedDoc.error })

            res.json({ status: "success", deletedDoc: deletedDoc })

        } catch (e) {
            console.log(e)
            res.status(500).json({ error: e })
        }
    }

    apiGetDocsList = async (req, res, next) => {
        try {

            // First check the objects sent through the body
            let { filter, projection } = req.body
            // If there's no filter, check the query sent via url
            if (!filter)
                filter = req.query

            const docs = await this.itemDAO.getList({
                filter,
                projection,
                limit: parseInt(req.query.limit) || 50,
                skip: parseInt(req.query.skip) || 0
            })
            // console.log(docs)
            res.json(docs)

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

    apiGetDocsByFields = async (req, res, next) => {
        try {

            //console.log(req)
            const fields = req.query
            const docs = await BaseDAO.getByFields(fields)
            //console.loc(docs)
            res.json(docs)

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

    apiGetDocDetails = async (req, res, next) => {
        try {

            let doc = await this.itemDAO.getById(req.body._id)
            if (!doc)
                return res.status(400).json({ error: "Unable to retrieve the document" })

            res.json({ status: "success", doc: doc })

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

    apiUpdateDoc = async (req, res, next) => {
        try {

            // Update the whole document from the data sent from the frontend
            let _id = req.body._id
            if (!_id)
                return res.status(400).json({ error: "The document must have an _id field" })

            delete req.body._id
            //let doc = prepareDocObject(req)
            let doc = req.body

            // Update
            let updatedDoc = await this.itemDAO.update(_id, doc)

            // Handle errors    console.log(updatedProject)
            if (updatedDoc.error)
                return res.status(400).json({ error: updatedDoc.error })

            if (updatedDoc.result.nModified === 0)
                return res.status(400).json({ error: "Couldn't update the document" })

            res.json({ status: "success" })

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

    apiGetMax = async (req, res, next) => {
        try {

            const field = req.params.field

            const projection = { _id: 0, [field]: 1 }

            const doc = await this.itemDAO.getMax({
                fieldMax: field,
                projection
            })
            res.json({
                status: "success",
                [field]: _.get(doc, field)
            })

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

    apiExists = async (req, res, next) => {
        try {

            const { field, value } = req.params

            const response = await this.itemDAO.exists({
                [field]: value
            })

            res.json(response)

        } catch (e) {
            res.status(500).json({ error: e })
        }
    }

}
/*
BaseController.prepareDocObject = (req) => {
    // The frontend must provide the values for the following fields
    let doc = { ...req.body }
    return doc
}*/
module.exports = BaseController