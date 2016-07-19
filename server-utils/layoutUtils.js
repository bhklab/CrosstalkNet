'use strict'
var configUtils = require('./configUtils');
var nodeUtils = require('./nodeUtils');
var styleUtils = require('./styleUtils');
var clone = require('clone');

function createPresetLayout() {
    var layout = {
        name: "preset"
    };

    return layout;
}

function createGridLayout(rows, cols) {
    var layout = {
        name: "grid",
        padding: 100,
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        avoidOverlapPadding: 25,
        cols: cols,
        rows: rows,
        position: "grid"
    };

    return layout;
}

function createRandomLayout(numNodes, nodeSize) {
    var r = nodeSize / 2;
    var areaRequired = numNodes * Math.PI * (r * r) * 40;
    var height = Math.sqrt(areaRequired / (16 / 9));
    var width = height * (16 / 9);

    var layout = {
        name: "random",
        fit: "false",
        boundingBox: { x1: 0, y1: 0, w: width, h: height }
    };

    return layout;
}

function createGridLayoutWithDimensions(nodes) {
    var layout;
    var maxRows = 1;
    var maxCols = 1 + nodes.length;


    for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].length > maxRows) {
            maxRows = nodes[j].length;
        }
    }

    layout = createGridLayout(maxRows, maxCols);

    return layout;
}

module.exports = {
    createPresetLayout: createPresetLayout,
    createRandomLayout: createRandomLayout,
    createGridLayout: createGridLayout,
    createGridLayoutWithDimensions: createGridLayoutWithDimensions
};
