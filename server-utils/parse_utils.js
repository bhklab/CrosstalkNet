'use strict'
/**
 * This file contains functions that help with the parsing of
 * of values returned from R scripts. The objective of these
 * functions is to delegate the assigning of different objects
 * away from server.js in an attempt to reduce the amount of code
 * in server.js.
 *
 * @summary Functions for parsing values returned from R scripts.
 */

/**
 * @summary Creates an object containing the minimum and maximum weights
 * returned from an R script.
 *
 * @param {Object} weights An object returned from an R script containing 
 * the minimum and maximum weights for a specific graph.
 *
 * @return {Object} An object nearly identical to weights but with different keys.
 */
function parseMinMaxWeights(weights) {
    var result = {
        minNegative: weights.minNegativeWeight,
        maxPositive: weights.maxPositiveWeight,
        maxNegative: weights.maxNegativeWeight,
        minPositive: weights.minPositiveWeight
    };

    return result;
}

/**
 * @summary Changes objects property names so that they don't 
 * include dots in them.
 *
 * @param {Array} objects An array of objects whose properties need
 * to be changed to not include dots.
 * @return {Array} An array of objects with property names not contaning
 * dots.
 */

function removeDotsFromPropertyNames(objects) {
    var result = [];

    result = objects.map(function(obj) {
        for (var prop in obj) {
            if (prop.indexOf(".") > 0) {
                var splitted = prop.split(".");

                if (splitted.length == 2) {
                    if (!obj[splitted[0]]) {
                        obj[splitted[0]] = {};                        
                    }
                    
                    obj[splitted[0]][splitted[1]] = obj[prop];
                    delete obj[prop];
                }
            }
        }

        return obj;
    });

    return result;
}


/**
 * @summary Converts a dot separated string into camelCase.
 *
 * @param {String} prop A dot separated string.
 * @return {String} The specified in string in camelCase.
 */
function toCamelCase(prop) {
    var splitted = prop.split(".");

    if (splitted.length < 1) {
        return prop;
    }

    var result = splitted[0];

    for (var i = 1; i < splitted.length; i++) {
        result += splitted[i].length > 0 ? splitted[i][0].toUpperCase() + splitted[i].slice(1) : "";
    }

    return result;
}

/**
 * @summary Flattens an array of arrays.
 *
 * @param {Array} array An array of arrays to be flattened.
 * @return A flattened version of the specified array.
 */
function flatten(array) {
    return array.reduce(function(memo, el) {
        var items = Array.isArray(el) ? flatten(el) : [el];
        return memo.concat(items);
    }, []);
}


module.exports = {
    parseMinMaxWeights: parseMinMaxWeights,
    removeDotsFromPropertyNames: removeDotsFromPropertyNames,
    flatten: flatten
};
