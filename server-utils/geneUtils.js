'use strict'

/**
 * This file contains functions that create gene lists based on the names and degrees of
 * genes from R output.
 * 
 * @summary Methods for creating gene lists.
 */

 /**
  * @summary Creates an array of objects representing genes and their
  * corresponding degrees.
  *
  * @param {Array} An array of strings containing gene names.
  * @param {Array} An array of integers corresponding to the degrees of the
  * genes in geneNames.
  * @return {Array} An array of objects that have two properties. The first property is
  * the name of a gene, and the second property is the degree of that gene.
  */
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