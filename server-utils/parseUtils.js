'use strict'

function parsePostBody(body) {
    var result = {};

    for (var prop in body) {
        result[prop] = body[prop];
    }

    return result;
}

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
    parsePostBody: parsePostBody,
    parseMinMaxWeights: parseMinMaxWeights
};