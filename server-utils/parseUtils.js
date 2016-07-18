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



module.exports = {
    parseMinMaxWeights: parseMinMaxWeights
};