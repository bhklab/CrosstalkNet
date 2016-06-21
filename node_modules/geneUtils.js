'use strict'

function createGeneList(genesNames, degrees) {
    var result = [];

    for (var i = 0; i < genesNames.length; i++) {
        result.push({ name: genesNames[i], degree: degrees[i] });
    }

    return result;
}

module.exports = {
    createGeneList: createGeneList
};