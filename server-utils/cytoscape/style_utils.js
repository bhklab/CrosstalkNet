'use strict'
/**
 * This file contains functions and objects that help with the styling of 
 * cytoscape.js elements. Styling objects exist for different layout types.
 *
 * @summary Functions and objects for styling cytoscape.js elements.
 */

var clone = require('clone');
var classSuffixes = { nodeColor: 'node-color', nodeShape: 'shape', nodeSize: 'node-size', labelPlacement: 'label-placement', labelBackground: 'label-background' };
var nodeSizes = { small: 12, medium: 18, large: 20, source: 40 };
var fontSizes = { source: 24 };
var epiColor = 'red';
var stromaColor = 'blue';

var bipartiteStyles = {
    epi: {
        nodeColor: {
            'selector': '.epi-' + classSuffixes.nodeColor,
            'style': {
                'background-color': epiColor,
            }
        },
        labelPlacement: {
            'selector': '.epi-' + classSuffixes.labelPlacement,
            'style': {
                'text-halign': 'center',
                'text-valign': 'center',
                'text-outline-color': epiColor,
                'text-outline-width': 1.1,
                'color': 'white',
                'font-family': 'Verdana'
            }
        },
        nodeShape: {
            'selector': '.epi-' + classSuffixes.nodeShape,
            'style': {
                'shape': 'circle'
            }
        }
    },
    stroma: {
        nodeColor: {
            'selector': '.stroma-' + classSuffixes.nodeColor,
            'style': {
                'background-color': stromaColor,
            }
        },
        labelPlacement: {
            'selector': '.stroma-' + classSuffixes.labelPlacement,
            'style': {
                'text-halign': 'center',
                'text-valign': 'center',
                'text-outline-color': stromaColor,
                'text-outline-width': 1.1,
                'color': 'white',
                'font-family': 'Verdana'
            }
        },
        nodeShape: {
            'selector': '.stroma-' + classSuffixes.nodeShape,
            'style': {
                'shape': 'triangle'
            }
        }
    }
};

var randomStyles = {
    stripedSourceEpi: {
        'selector': '.sourceNode.epi',
        'style': {
            'pie-size': '100%',
            'pie-1-background-color': '#D500F9',
            'pie-1-background-size': '50',
            'pie-2-background-color': epiColor,
            'pie-2-background-size': '50',
            'height': '40px',
            'width': '40px'
        }
    },
    stripedSourceStroma: {
        'selector': '.sourceNode.stroma',
        'style': {
            'pie-size': '100%',
            'pie-1-background-color': '#D500F9',
            'pie-1-background-size': '50',
            'pie-2-background-color': stromaColor,
            'pie-2-background-size': '50',
            'height': '40px',
            'width': '40px'
        }
    },
    labelBackground: {
        'selector': 'node',
        'style': {}
    }
};

var nodeSize = {
    small: {
        'selector': 'node',
        'style': {
            'width': nodeSizes.small + 'px',
            'height': nodeSizes.small + 'px'
        }
    },
    medium: {
        'selector': 'node',
        'style': {
            'width': nodeSizes.medium + 'px',
            'height': nodeSizes.medium + 'px'
        }
    },
    large: {
        'selector': 'node',
        'style': {
            'width': nodeSizes.large + 'px',
            'height': nodeSizes.large + 'px'
        }
    },
    source: {
        'selector': '.sourceNode',
        'style': {
            'height': nodeSizes.source + 'px',
            'width': nodeSizes.source + 'px'
        }
    }
};

var fontSize = {
    source: {
        'selector': '.sourceNode',
        'style': {
            'font-size': fontSizes.source + 'px'
        }
    }
};

var selfLoopEdge = {
    'curve-style': 'bezier',
    'line-style': 'solid',
    'line-color': '#FF6D00',
    'target-arrow-color': '#FF6D00',
    'target-arrow-shape': 'triangle'
};

var edgeWeights = {
    positive: {
        selector: 'edge[weight>=0]',
        style: {
            width: '',
            'line-color': 'black',
            opacity: ''
        }
    },
    negative: {
        selector: 'edge[weight<0]',
        style: {
            width: '',
            'line-color': 'cyan',
            opacity: ''
        }
    }
};

var noLabel = {
    selector: 'node',
    style: {
        label: ""
    }
};

var invisibleParent = {
    selector: 'node:parent',
    style: {
        'background-opacity': 0,
        'border-width': '0px',
        'label': 'data(id)',
        'font-size': '100px'
    }
};

var communityEdge = {
    selector: 'edge',
    style: {
        width: '1px',
        'line-color': 'grey',
        'events': 'no'
    }
};

var communityNode = {
    selector: "node[top]",
    style: {
        'label': 'data(par)',
        'font-size': '100px',
        'color': 'black',
        'text-events': 'yes'
    }
};

var allRandomFormats = [nodeSize.medium, randomStyles.stripedSourceEpi, randomStyles.stripedSourceStroma, randomStyles.labelBackground, bipartiteStyles.epi.nodeColor,
    bipartiteStyles.epi.labelPlacement, bipartiteStyles.stroma.nodeColor, bipartiteStyles.stroma.labelPlacement, bipartiteStyles.epi.nodeShape, bipartiteStyles.stroma.nodeShape
];

var allConcentricFormats = [nodeSize.medium, nodeSize.source, bipartiteStyles.epi.nodeColor,
    bipartiteStyles.epi.labelPlacement, bipartiteStyles.stroma.nodeColor, bipartiteStyles.stroma.labelPlacement, 
    bipartiteStyles.epi.nodeShape, bipartiteStyles.stroma.nodeShape, fontSize.source
];

/**
 * @summary Obtains an array of all styles required for a bipartite view of the graph.
 *
 * @return {Array} An array of cytoscape.js styles for a bipartite view of the graph.
 */
function getAllBipartiteStyles() {
    var styles = [];

    for (var prop in bipartiteStyles.epi) {
        styles.push(bipartiteStyles.epi[prop]);
    }

    for (var prop in bipartiteStyles.stroma) {
        styles.push(bipartiteStyles.stroma[prop]);
    }

    return styles;
}

/**
 * @summary Creates a dynamic style for the width of cytoscape.js edges.
 *
 * @param {String} property The property that will be mapped in order
 * to dynamically obtain edge with.
 * @param {Number} min The minimum value of the weight of an edge in a group of edges.
 * @param {Number} min The maximum value of the weight of an edge in a group of edges.
 * @return {String} A cytoscape.js style string for the width of edges.
 */
function getDynamicWidth(property, min, max) {
    if (Number(min) == Number(max)) {
        return "1px";
    }

    if (min < 0) {
        // var width = Math.abs(Math.floor((min - max) * 10)) > 6 ? Math.abs(Math.floor((min - max) * 10)) : 6;
        var width = 6;
        return 'mapData(' + property + ',' + min + ',' + max + ',' + width + "px" + "," + "1px" + ")";
    } else {
        // var width = Math.abs(Math.floor((max - min) * 10)) > 6 ? Math.abs(Math.floor((max - min) * 10)) : 6;
        var width = 6;
        return 'mapData(' + property + ',' + min + ',' + max + ',' + "1px" + "," + width + "px" + ")";
    }
}

/**
 * @summary Creates a dynamic style for the color of cytoscape.js edges.
 *
 * @param {String} property The property that will be mapped in order
 * to dynamically obtain edge with.
 * @param {Number} min The minimum value of the weight of an edge in a group of edges.
 * @param {Number} min The maximum value of the weight of an edge in a group of edges.
 * @return {String} A cytoscape.js style string for the color of edges.
 */
function getDynamicColor(property, min, max) {
    if (min < 0) {
        if (Number(min) == Number(max)) {
            return '#e600e6';
        }

        return 'mapData(' + property + ',' + min + ',' + max + ',' + "#ffb3ff" + "," + "#e600e6" + ")";
    } else {
        if (Number(min) == Number(max)) {
            return 'black';
        }

        return 'mapData(' + property + ',' + min + ',' + max + ',' + "#a6a6a6" + "," + "black" + ")";
    }
}

/**
 * @summary Sets the width and the line-color of the given edge style 
 * to dynamic values based on the overall weights.
 *
 * @param {Object} A cytoscape.js style object found in edgeWeights. The selector
 * should be based on the weight of the edges.
 * @param {Object} An object containing the min and max weight to use for styling.
 * @return {Object} A cytoscape.hs style object for edges with dynamic styles for 
 * width and line-color.
 */
function setDynamicEdgeStyles(edgeStyle, overallWeights) {
    edgeStyle = clone(edgeStyle);
    edgeStyle.style.width = getDynamicWidth('weight', overallWeights.min, overallWeights.max);
    edgeStyle.style['line-color'] = getDynamicColor('weight', overallWeights.min, overallWeights.max);

    return edgeStyle;
}

function createRandomColor(generated) {
    var unique = false;
    var iterations = 0;

    while (!unique) {
        if (iterations > 1000) {
            break;
        }

        var r = Math.floor((Math.random() * 255) + 1);
        var g = Math.floor((Math.random() * 255) + 1);
        var b = Math.floor((Math.random() * 255) + 1);

        var colorString = "rgb(" + r + ", " + g + ", " + b + ")";

        if (generated.indexOf(colorString) < 0) {
            unique = true;
        }
    }

    return colorString;
}

function createCommunityStyle(geneType, nodeClass, color, shape) {
    var style = {
        selector: "." + nodeClass + "." + geneType,
        style: {
            'background-color': color,
            'shape': shape
        }
    }

    return style;
}

module.exports = {
    epiColor: epiColor,
    stromaColor: stromaColor,
    getAllBipartiteStyles: getAllBipartiteStyles,
    allRandomFormats: allRandomFormats,
    allConcentricFormats: allConcentricFormats,
    classSuffixes: classSuffixes,
    nodeSizes: nodeSizes,
    selfLoopEdge: selfLoopEdge,
    bipartiteStyles: bipartiteStyles,
    nodeSize: nodeSize,
    randomStyles: randomStyles,
    edgeWeights: edgeWeights,
    getDynamicWidth: getDynamicWidth,
    getDynamicColor: getDynamicColor,
    setDynamicEdgeStyles: setDynamicEdgeStyles,
    noLabel: noLabel,
    invisibleParent: invisibleParent,
    communityEdge: communityEdge,
    communityNode: communityNode,
    createRandomColor: createRandomColor,
    createCommunityStyle: createCommunityStyle
};
