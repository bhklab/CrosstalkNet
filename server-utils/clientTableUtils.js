'use strict'

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

function getSelfLoops(edges) {
    var result = [];

    for (var i = 0; i < edges.length; i++) {
        var source = edges[i].data.source.substr(0, edges[i].data.source.length - 2);
        var target = edges[i].data.target.substr(0, edges[i].data.target.length - 2);

        if (source == target) {
            result.push(source);
            /*
            if (result.indexOf(source) < 0) {
               
            }*/
        }
    }

    return result;
}

module.exports = {
    getSelfLoops: getSelfLoops,
    createEdgeDictionaryFromREdges: createEdgeDictionaryFromREdges
};
