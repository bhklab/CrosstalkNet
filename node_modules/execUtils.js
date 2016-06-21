'use strict'

function createArgsStringFromArray(arr) {
    var argsString = "";

    for (var i = 0; i < arr.length; i++) {
        argsString += "\"" + arr[i] + "\"";
        argsString += " ";
    }

    return argsString;
}

module.exports = {
    createArgsStringFromArray: createArgsStringFromArray
};