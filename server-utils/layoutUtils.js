'use strict'
var configUtils = require('./configUtils');
var nodeUtils = require('./nodeUtils');
var styleUtils = require('./styleUtils');

function createPresetLayout() {
    var layout = {
        name: "preset"
    };

    return layout;
}

function createGridLayout(rows, cols) {
    var layout = {
        name: "grid",
        padding: 5,
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        avoidOverlapPadding: 10,
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

function applyGridLayoutToConfig(config, nodes) {
    var layout;
    var maxRows = 1;
    var maxCols = 1 + nodes.length;

    for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].length > maxRows) {
            maxRows = nodes[j].length;
        }
    }

    for (var j = 0; j < nodes.length; j++) {
        nodeUtils.positionNodesBipartiteGrid(nodes[j]);
    }

    layout = createGridLayout(maxRows, maxCols);

    configUtils.addStylesToConfig(config, styleUtils.getAllBipartiteStyles());
    configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
    configUtils.setConfigLayout(config, layout);
}

module.exports = {
    createPresetLayout: createPresetLayout,
    createRandomLayout: createRandomLayout,
    createGridLayout: createGridLayout,
    applyGridLayoutToConfig: applyGridLayoutToConfig
};
