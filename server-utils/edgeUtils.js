'use strict'
/**
 * This file contains functions that help create cytoscape.js edges from pseudo-edges
 * returned from R scripts.
 * @summary Methods for creating cytoscape.js edges.
 */

/**
 * @summary Returns an array of cytoscape.js edges generated from pseuo-edges
 * returned from R scripts.
 *
 * @param {Array} REdges An array of pseudo-edges returned from an R script.
 * @param {number} neighbourLevel A number indicating which level of neighbours
 * these edges correspond to.
 * @return {Array} An array of cytoscape.js edges with their neighbourLevel set
 * to the specified neighbourLevel.
 */

function createEdgesFromREdges(REdges, neighbourLevel) {
    var edges = [];

    for (var i = 0; i < REdges.length; i++) {
        var source = REdges[i].source;
        var target = REdges[i].target;
        var weight = REdges[i].weight;

        edges.push({
            data: {
                id: source + target,
                source: source,
                target: target,
                weight: weight,
                neighbourLevel: neighbourLevel
            }
        });
    }

    return edges;
}

module.exports = {
    createEdgesFromREdges: createEdgesFromREdges
};