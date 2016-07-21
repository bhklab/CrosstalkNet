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
    flatten: flatten
};