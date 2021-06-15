const { ObjectId } = require("mongodb")
const {
    prepareUniqueFieldsObject,
    prepareUpdateFieldsObject
} = require("./utils")

/**
 * Parent class to be extended for the DAOs of the app
 * BaseDAO.collection = undefined  // to be defined in the child classes
 * 
 */
class BaseDAO {

    constructor(collectionName) {
        this.collectionName = collectionName
    }

    injectDB = async (conn) => {
        //console.log('BaseDAO.injectDB()', this.collectionName)
        if (this.collection)
            return

        try {
            // console.log("\n\nInjecting...")
            this.collection = await conn
                .db(process.env.DB_NAME)
                .collection(this.collectionName)
            //console.log('BaseDAO.injectDB() try{}', this.collectionName ? true : false)
            console.log(`${this.collectionName} collection injected!`)
        } catch (e) {
            console.error(`Unable to establish collection handles: ${e}`)
        }
    }

    /**
     * Adds a document to the collection
     * @param {Object} obj - The fields and values of the document
     * @returns {DAOResponse} Returns an object with either DB response or "error"
     */
    add = async (obj) => {
        try {
            //console.log(obj)
            return await this.collection.insertOne({ ...obj })
        } catch (e) {
            console.error(`Unable to add document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Updates the fields of a document in the collection
     * @param {string} id - Document _id
     * @param {Object} updateFields - Object with the name of the fields to update and their values
     * @param {Date} date - Date of the update
     */
    update = async (_id, updateFields) => {
        try {

            return await this.collection.updateOne(
                { _id: ObjectId(_id) },
                { $set: { ...updateFields } }
            )
        } catch (e) {
            console.error(`Unable to update document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Delete a document from the collection specifying its (MongoDB) _id
     * @param {ObjectId} _id 
     */
    deleteById = async (_id) => {
        try {
            return await this.collection.deleteOne({ _id: ObjectId(_id) })
        } catch (e) {
            console.error(`Unable to delete document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Delete documents
     * @param {Object} filter 
     */
    deleteMany = async ({ filter = {} }) => {
        try {
            return await this.collection.deleteMany(filter)
        } catch (e) {
            console.error(`Unable to delete documents: ${e}`)
            return { error: e }
        }
    }

    /**
     * Drop the collection (DANGEROUS!)
     */
    drop = async () => {
        try {
            return await this.collection.drop()
        } catch (e) {
            console.error(`Unable to drop the collection: ${e}`)
            return { error: e }
        }
    }

    /**
     * Get a list (array) of documents
     * @param {Integer} limit - number of documents to be retrieved
     * @param {Integer} skip - number of documents to be skipped
     * @returns {Array} array of documents
     */
    getList = async ({ filter = {}, projection = {}, limit = 50, skip = 0 }) => {
        try {

            if (filter._id)
                filter._id = ObjectId(filter._id)

            const docs = await this.collection.find(filter, projection).limit(limit).skip(skip).toArray()
            return docs
        } catch (e) {
            console.error(`Unable to get the list of documents: ${e}`)
            return { error: e }
        }
    }

    /**
     * Get a document by id
     * @param {string} id - Document _id
     */
    getById = async (_id) => {
        try {
            return await this.collection.findOne({ _id: ObjectId(_id) })
        } catch (e) {
            console.error(`Unable to get the document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Get the first document filtering by a specific field
     * @param {Object} fields - fields of the document
     */
    getByFields = async (fields) => {
        try {
            //console.log('inside getByFields()', { ...fields })
            //console.log(this.collection)
            const doc = await this.collection.findOne({ ...fields })
            //console.log('inside getByFields()', doc)
            return doc
        } catch (e) {
            console.error(`Unable to get the document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Check if a document with a given fields and values exists
     * @param {Object} fields - fields of the document
     * @returns {Object} if it exists: { res: true, _id }, with _id as a String
     *                   if it doesn't exist: { res: false }
     */
    exists = async (fields) => {
        try {
            const filter = fields
            let projection = { _id: 1 }

            const obj = await this.collection.findOne(filter, projection)
            return obj ?
                { exists: true, _id: ObjectId(obj._id).toString() } :
                { exists: false }
        } catch (e) {
            console.error(`Something happened: ${e}`)
            return { error: e }
        }
    }

    /**
     * Get the first document containing the minimum value in a given field (fieldMin)
     * @param {String} fieldMin - Name of the field to search for the minimum value
     * @param {Object} projection - MongoDB projection object
     * @returns {Object} projection of the document with the minimum value in the given field
     */
    getMin = async ({ fieldMin, projection = {} }) => {
        try {
            const sortObj = {}
            sortObj[fieldMin] = 1
            const doc = await this.collection.find({}, { projection })
                .sort(sortObj)
                .limit(1)       // cursor
                .toArray()      // array of documents
            return doc[0]
        } catch (e) {
            console.error(e)
            return { error: e }
        }
    }

    /**
     * Get the first document containing the maximum value in a given field (fieldMax)
     * @param {String} fieldMax - Name of the field to search for the maximum value
     * @param {Object} projection - MongoDB projection object
     * @returns {Object} projection of the document with the maximum value in the given field
     */
    getMax = async ({ fieldMax, projection = {} }) => {
        try {
            const sortObj = {}
            sortObj[fieldMax] = -1
            const doc = await this.collection.find({}, { projection })
                .sort(sortObj)
                .limit(1)       // cursor
                .toArray()      // array of documents
            return doc[0]
        } catch (e) {
            console.error(e)
            return { error: e }
        }
    }

    /**
     * Push an element into an array field of a document
     * @param {string} _id - Document _id
     * @param {Object} obj - Contains the keys of array fields of the document and the values to be pushed
     * Example of usage:
     *  _id: "abcdabcdabcd"
     *  obj: { tasks: { date: "2018-08-08", type: "Design" }}
     *  Inserts { date: "2018-08-08", type: "Design" } 
     *  to the "tasks" array field of the document _id of the collection in the DAO object.
     */
    pushToArrays = async ({ _id, obj }) => {
        try {

            return await this.collection.updateOne(
                { _id: ObjectId(_id) },
                { $push: obj }
            )

        } catch (e) {
            console.error(`Unable to update document: ${e}`)
            return { error: e }
        }
    }

    /**
     * Insert or update a subdocument in an array field of other document.
     * Possibility of having a field or combination of fields that must be unique between
     * the subdocuments of the array. 
     * If it exists another subdocument with the unique fields, the original subdocument
     * will be fully substituted with the new one (newSubdoc=true) or updated (newSubdoc=false).
     * If not, it will be inserted.
     * @param {String} _id - document _id
     * @param {String} arrayField - array field of the document where the subdocument will be upserted
     * @param {Object} subdoc - new subdocument to be upserted
     * @param {Array} uniqueFields - Array of strings containing the keys of the unique fields
     * @param {Boolean} newSubdoc - Specifies whether the upsert operation should 
     * completely substitute the old subdoc with the new one (newSubdoc=true), or
     * only update passed keys in the subdoc object (newSubdoc=false, default option)
     */
    upsertSubdoc = async ({ _id, arrayField, subdoc, uniqueFields = [], newSubdoc = false }) => {
        try {

            let updateResult

            if (uniqueFields.length > 0) {

                // Array to be used with the MongoDB arrayFilters
                let arrayFiltersObj = prepareUniqueFieldsObject({ subdoc, uniqueFields })
                //console.log(arrayFiltersObj)
                // Auxiliary object to be used in $set,
                // to indicate the array field where the subdocument is going to be updated
                let setObj = {}
                if (newSubdoc)
                    setObj[arrayField + ".$[elem]"] = subdoc
                else
                    setObj = prepareUpdateFieldsObject({
                        arrayField, subdoc, placeholder: "elem"
                    })

                //console.log(setObj)
                // Update the subdocument                
                updateResult = await this.collection.updateOne(
                    { _id: ObjectId(_id) },
                    { $set: setObj },
                    { arrayFilters: [arrayFiltersObj] }
                )
                //console.log(updateResult)                          
            }

            if (!updateResult || updateResult.modifiedCount === 0) {
                //console.log('--> inside if not updateResult')
                // If the task_internal_id didn't exist in the tasks array,
                // push the newTask to the array
                let obj = {}
                obj[arrayField] = subdoc
                //console.log(obj)
                const pushResult = await this.pushToArrays({ _id, obj })
                //console.log(pushResult.result)
                return pushResult

            }

            return updateResult

        } catch (e) {
            console.error(`Unable to upsert the subdocument: ${e}`)
            return { error: e }
        }
    }

}

module.exports = BaseDAO