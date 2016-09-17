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
 * @param {Array} geneNames An array of strings containing gene names.
 * @param {Array} degrees An array of integers corresponding to the degrees of the
 * genes in geneNames.
 * @return {Array} An array of objects that have two properties. The first property is
 * the name of a gene, and the second property is the degree of that gene.
 */
function createGeneList(geneNames, degrees) {
    var result = [];

    if (!Array.isArray(geneNames)) {
        geneNames = [geneNames];
    }

    if (!Array.isArray(degrees)) {
        degrees = [degrees];
    }

    for (var i = 0; i < geneNames.length; i++) {
        result.push({ name: geneNames[i], degree: degrees[i] });
    }

    result = result.map(function(gene) {
        return {
            value: gene.name,
            display: gene.name + ' ' + gene.degree,
            object: gene
        };
    });

    return result;
}

module.exports = {
    createGeneList: createGeneList
};
