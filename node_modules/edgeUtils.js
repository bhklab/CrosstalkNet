'use strict'

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