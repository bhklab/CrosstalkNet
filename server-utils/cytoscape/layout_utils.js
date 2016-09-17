'use strict'
/**
 * This file contains functions that create layouts for cytoscape.js.
 * 
 * @summary Functions for creating cytoscape.js layouts.
 */
var configUtils = require('./config_utils');
var nodeUtils = require('./node_utils');
var styleUtils = require('./style_utils');
var clone = require('clone');

/**
 * @summary Creates a preset layout.
 *
 * @return {Object} A preset cytoscape.js layout. This used when 
 * the positions of nodes are set manually.
 */
function createPresetLayout() {
    var layout = {
        name: "preset"
    };

    return layout;
}

/**
 * @summary Creates a grid layout.
 *
 * @param {number} rows The number of rows that the grid should have.
 * @param {number} cols The number of columns that the grid should have.
 * @return {Object} A cytoscape.js grid layout with the specified number of
 * rows and columns.
 */
function createGridLayout(rows, cols) {
    var layout = {
        name: "grid",
        padding: 100,
        avoidOverlap: true,
        avoidOverlapPadding: 25,
        cols: cols,
        rows: rows,
        position: "grid"
    };

    return layout;
}

/**
 * @summary Creates a random layout.
 *
 * @param {number} numNodes The number of nodes that will be in the graph. This is
 * used to determine the size of the bounding box.
 * @param {number} nodeSize The average size of a node in pixels. This is used
 * to determine the size of the bounding box.
 * @return {Object} A cytoscape.js random layout. The size of the bounding box is 
 * determined by a combination of numNodes and nodeSize.
 */
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

module.exports = {
    createPresetLayout: createPresetLayout,
    createRandomLayout: createRandomLayout,
    createGridLayout: createGridLayout,
};
