const _ = require('lodash')


/**
 * Source: https://gist.github.com/penguinboy/762197
 * @param {Object} object 
 * @param {String} separator 
 */
const flatten = (object, separator = '.') => {
    return Object.assign({}, ...function _flatten(child, path = []) {
        return [].concat(...Object.keys(child).map(key => typeof child[key] === 'object'
            ? _flatten(child[key], path.concat([key]))
            : ({ [path.concat([key]).join(separator)]: child[key] })
        ));
    }(object));
}

/**
 * Create an object containing all the fields in "uniqueFields" and the corresponding
 * values of the object "subdoc".
 * Each property has the prefix "elem.".
 * To be used for an update query in MongoDB with arrayFilters
 * Example of usage:
 *  subdoc: { a: 1, b: 1, c: { d: 1 } }
 *  uniqueFields: [ "a", "c.d" ]
 *  placeholder: "elem"
 *  returns { "elem.a": 1, "elem.c.d": 1 }
 * @param {Object} subdoc
 * @param {Array of Strings} uniqueFields
 * @param {String} placeholder
 * @returns {Object}
 */
const prepareUniqueFieldsObject = ({ 
    subdoc, uniqueFields, placeholder = "elem" 
}) => {
    let obj = {}
    uniqueFields.forEach(prop => {
        let keyname = placeholder + "." + prop
        obj[keyname] = _.get(subdoc, prop)
    })
    return obj
}

const prepareUpdateFieldsObject = ({ 
    arrayField, subdoc, placeholder = "elem" 
}) => {
    let flatObj = flatten(subdoc)
    let res = {}
    Object.keys(flatObj).forEach(prop => {
        let keyname = `${arrayField}.$[${placeholder}].${prop}`
        res[keyname] = _.get(subdoc, prop)
    })
    return res
}


module.exports = {
    flatten,
    prepareUniqueFieldsObject,
    prepareUpdateFieldsObject
}