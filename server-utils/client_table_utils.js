'use strict'
/**
 * This file contains functions that help create data structures that
 * are used in the table view of the web app. The edge dictionary is used
 * to quickly determine the edge between two nodes, and the self loops are
 * just an array of self loops. 
 *
 * @summary Methods for creating table view data structures for the client.
 *
 */

/**
 * @summary Returns a dictionary representing edge weights between genes.
 *
 * @param {Object} REdges An array of edges returned from an R script.
 * @return {Object} A dictionary of dictionaries. The top level dictionary has
 * keys that are the source nodes of edges, and the values of those keys are dictionaries.
 * These bottom level dictionaries have keys that are the targets of edges and values
 * that are the edge weight between the source and target nodes.
 */
function createEdgeDictionaryFromREdges(REdges) {
    var dictionary = {};
    dictionary.types = ["weight"];
    if (REdges.length > 0) {
        if (REdges[0].normal != null) {
            dictionary.types.push("normal");
        }

        if (REdges[0].tumor != null) {
            dictionary.types.push("tumor");
        }
    }

    for (var i = 0; i < REdges.length; i++) {
        var id = REdges[i].source;
        if (id.endsWith('-E')) {
            if (dictionary[id] == null) {
                dictionary[id] = {};
            }

            dictionary[id][REdges[i].target] = { weight: REdges[i].weight };

            if (REdges[i].normal != null) {
                dictionary[id][REdges[i].target].normal = REdges[i].normal;
            }

            if (REdges[i].tumor != null) {
                dictionary[id][REdges[i].target].tumor = REdges[i].tumor;
            }
        } else {
            id = REdges[i].target;

            if (dictionary[id] == null) {
                dictionary[id] = {};
            }

            dictionary[id][REdges[i].source] = { weight: REdges[i].weight };

            if (REdges[i].normal != null) {
                dictionary[id][REdges[i].source].normal = REdges[i].normal;
            }

            if (REdges[i].tumor != null) {
                dictionary[id][REdges[i].source].tumor = REdges[i].tumor;
            }
        }
    }

    return dictionary;
}

/**
 * @summary Returns an array of self loops for given edges.
 *
 * @param {Object} edges An array of cytoscape to calculate self loops from.
 * @return {Array} An array of string representing the self loops for the edges.
 */
function getSelfLoops(edges) {
    var result = [];

    for (var i = 0; i < edges.length; i++) {
        var source = edges[i].data.source.substr(0, edges[i].data.source.length - 2);
        var target = edges[i].data.target.substr(0, edges[i].data.target.length - 2);

        if (source == target) {
            result.push(source);
        }
    }

    return result;
}

module.exports = {
    getSelfLoops: getSelfLoops,
    createEdgeDictionaryFromREdges: createEdgeDictionaryFromREdges
};
