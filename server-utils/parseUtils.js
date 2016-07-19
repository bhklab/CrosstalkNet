'use strict'

function parseMinMaxWeights(weights) {
    var result = {
        minNegative: weights.minNegativeWeight,
        maxPositive: weights.maxPositiveWeight,
        maxNegative: weights.maxNegativeWeight,
        minPositive: weights.minPositiveWeight
    };

    return result;
}

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