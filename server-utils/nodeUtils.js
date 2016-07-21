'use strict'
/**
 * This file contains functions that create nodes for cytoscape.js configs. 
 * In addition, there are functions which add classes to nodes, an set the position of nodes.
 * 
 * @summary Functions for creating cytoscape.js nodes.
 */
var styleUtils = require('./styleUtils');
var clone = require('clone');

var classes = [];
for (var key in styleUtils.classSuffixes) {
    var value = styleUtils.classSuffixes[key];
    classes.push(value);
}

/**
 * @summary Creates a string of classes based on the suffixes
 * found in styleUtils and the specified prefix.
 *
 * @param {String} prefix A prefix to add to every suffix found in
 * the suffixes of styleUtils.
 * @return {String} A string of classes separated by spaces that is the 
 * result of concatenating prefix with the suffixes found in styleUtils.
 */
function createAllClasses(prefix) {
    var classesString = '';
    var classesConcatenated = classes.map(function(suffix) {
        return prefix + "-" + suffix;
    });

    classesString = classesConcatenated.join(" ");

    return classesString;
}

/**
 * @summary Adds a class to an array of nodes.
 *
 * @param {Array} nodes An array of cytoscape.js nodes
 * to add the classes to.
 * @param {String} newClass The class to add to the given
 * array of nodes.
 * @return {Array} An array of nodes with newClass added to 
 * all of the nodes.
 */
function addClassToNodes(nodes, newClass) {
    nodes = clone(nodes, false);

    if (!(nodes instanceof Array)) {
        nodes.classes = nodes.classes + " " + newClass;
    } else {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classes = nodes[i].classes + " " + newClass;
        }
    }

    return nodes;
}

/**
 * @summary Creates cytoscape.js nodes from scratch.
 *
 * @param {Array} genes An array of strings containing genes names
 * to be used as the IDs of the nodes.
 * @param {String} parent A string that is the ID of the parent container. 
 * @param {Array} An array of integers containing the degrees corresponding to
 * the provided genes.
 * @param {Number} neighbourLevel An integer indicating the neighbour level to
 * be added to each node. This is set to -1 for source nodes.
 * @return {Array} An array of cytoscape.js nodes.
 */
function createNodes(genes, parent, degrees, neighbourLevel) {
    var resultNodes = [];

    for (var i = 0; i < genes.length; i++) {
        var parentFromNode = genes[i].endsWith('-E') ? "epi" : "stroma";
        resultNodes.push({
            data: {
                id: genes[i],
                degree: degrees[i],
                parent: parent,
                neighbourLevel: neighbourLevel
            },
            classes: parentFromNode + " " + createAllClasses(parentFromNode)
        });
    }

    return resultNodes;
}

/**
 * @summary Creates cytoscape.js nodes from pseudo-nodes that are returned from 
 * R scripts.
 *
 * @param {Array} rNodes An array of pseudo-nodes returned from R. These fields
 * from these pseudo-nodes will be used to create the cytoscape.js nodes.
 * @return {Array} An array of cytoscape.js nodes based on pseudo-nodes returned from R.
 */
function createNodesFromRNodes(rNodes) {
    var resultNodes = [];

    for (var i = 0; i < rNodes.length; i++) {
        var parentFromNode = rNodes[i].name.endsWith('-E') ? "epi" : "stroma";
        resultNodes.push({
            data: {
                id: rNodes[i].name,
                degree: rNodes[i].degree,
                parent: 'par' + rNodes[i].level,
                neighbourLevel: rNodes[i].level,
                isSource: rNodes[i].isSource,
                type: parentFromNode
            },
            classes: parentFromNode + " " + createAllClasses(parentFromNode)
        });
    }

    return resultNodes;
}

/**
 * @summary Creates parent nodes for the Interaction Explorer 
 * based on selected genes and cytoscape.js nodes.
 *
 * @param {Array} selectedGenes An array of strings representing the 
 * genes selected by the user.
 * @param {Array} nodes An array of arrays of cytoscape.js nodes. This is 
 * used to determine whether or not to actually create a parent nodes depending
 * on whether or not the arrays are empty.
 * @return An array of cytoscape.js parent nodes.
 */
function createParentNodesIE(selectedGenes, nodes) {
    var parentNodes = [];

    for (var i = 0; i < selectedGenes.length + 1; i++) {
        if (i < 1) {
            parentNodes.push({
                data: {
                    id: "par" + i
                }
            });
        } else if (nodes[i - 1].length > 0) {
            parentNodes.push({
                data: {
                    id: "par" + i
                }
            });
        }
    }

    return parentNodes;
}

/**
 * @summary Creates parent nodes for the main graph .
 *
 * @param {Number} number The number of parent nodes to create.
 * @return {Array} An array of cytoscape.js parent nodes.
 */
function createParentNodesMG(number) {
    var parentNodes = [];

    for (var i = 0; i < number; i++) {
        parentNodes.push({
            data: {
                id: "par" + i
            }
        });
    }

    return parentNodes;
}

/**
 * Sets the col and row properties of an array of cytoscape.js
 * nodes. The neighbourLevel of these 
 * nodes will be used to set the column. A node's index in the array will be used
 * to determine its row. 
 *
 * @summary Sets the col and row property of an array
 * of cytoscape.js nodes.
 * 
 * @param {Array} nodes An array of cytoscape.js nodes.
 * @return {Array} An array of cytoscape.js nodes with their
 * col and row properties set.
 */
function positionNodesBipartiteGridHelper(nodes) {
    if (!Array.isArray(nodes)) {
        nodes  = [nodes];
    }

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.neighbourLevel != -1) {
            nodes[i].data.col = nodes[i].data.neighbourLevel + 1;
        } else {
            nodes[i].data.col = 1;
        }
        nodes[i].data.row = i + 1;
    }

    return nodes;
}

/**
 * @summary Positions an array of arrays of cytoscape.js
 * nodes in a bipartite fashion. 
 *
 * @param {Array} An array of arrays of cytoscape.js nodes. Having
 * this structure helps group nodes based on what neighbour level they are. 
 * This in turn is used for determining the row that each node should belong to.
 * @return {Array} An array of arrays of cytoscape.js nodes positioned in a bipartite
 * way.
 */
function positionNodesBipartiteGrid(nodes) {
    nodes = clone(nodes);

    for (var j = 0; j < nodes.length; j++) {
        nodes[j] = positionNodesBipartiteGridHelper(nodes[j]);
    }

    return nodes;
}

/**
 * @summary Checks if an array of arrays of nodes contains
 * any nodes.
 *
 * @param {Array} An array of arrays of cytoscape.js nodes.
 * @return {Number} 1 if there is a nodes, 0 otherwise.
 */
function isNodesArrayFull(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].length > 0) {
            return 1;
        }
    }

    return 0;
}

/**
 * Positions nodes in a concentric way. The context of multiple selected genes is taken into consideration.
 * The specified selected gene will be at the center of the possible 2 circles. NEEDS MORE DOCUMENTATION.
 *
 * @summary Positions nodes in a concentric way.
 *
 * @param {Object} selectedGene A cytoscape.js node that will be at the center of a cluster. 
 * It's neighbours will be positioned around it in 1 or 2 circles depending on the neighbour level.
 * @param {Array} firstNeighbours An array of cytoscape.js nodes representing the first neighbours of
 * the selected gene. These will be placed in the first ring around the selected gene.
 * @param {Array} secondNeighbours An array of cytoscape.js nodes representing the second neighbours of
 * the selected gene. These will be placed in the second ring around the selected gene.
 * @param {Number} clusterNumbe A number representing which cluster is currently being created. This is used 
 * to position clusters around each
 */
function positionNodesClustered(selectedGene, firstNeighbours, secondNeighbours, clusterNumber, totalClusters, nodeRadius, largestClusterRadius) {
    var mainRadius = Math.max((totalClusters * (largestClusterRadius * 2) * 1.3) / (2 * Math.PI), largestClusterRadius + 100);
    var firstNeighbourRadius = getMinRadius(firstNeighbours.length, nodeRadius);
    var secondNeighbourRadius = firstNeighbourRadius + getMinRadius(secondNeighbours.length, nodeRadius);

    var selectedGeneAngle = ((2 * Math.PI) / totalClusters) * (clusterNumber + 1);

    selectedGene = clone(selectedGene);
    firstNeighbours = clone(firstNeighbours);
    secondNeighbours = clone(secondNeighbours);

    selectedGene.position = {
        x: mainRadius * Math.cos(selectedGeneAngle),
        y: mainRadius * Math.sin(selectedGeneAngle)
    }

    for (var i = 0; i < firstNeighbours.length; i++) {
        var firstNeighbourAngle = ((2 * Math.PI) / firstNeighbours.length) * (i + 1);
        firstNeighbours[i].position = {
            x: (firstNeighbourRadius * Math.cos(firstNeighbourAngle)) + selectedGene.position.x,
            y: (firstNeighbourRadius * Math.sin(firstNeighbourAngle)) + selectedGene.position.y
        };
    }

    for (var i = 0; i < secondNeighbours.length; i++) {
        var secondNeighbourAngle = ((2 * Math.PI) / secondNeighbours.length) * i;
        secondNeighbours[i].position = {
            x: (secondNeighbourRadius * Math.cos(secondNeighbourAngle)) + selectedGene.position.x,
            y: (secondNeighbourRadius * Math.sin(secondNeighbourAngle)) + selectedGene.position.y
        };
    }

    return {
        selectedGene: selectedGene,
        firstNeighbours: firstNeighbours,
        secondNeighbours: secondNeighbours
    };
}

function getMinRadius(numNodes, nodeRadius) {
    return Math.max((3 * numNodes * (nodeRadius * 2)) / (2 * Math.PI), 120);
}

module.exports = {
    addClassToNodes: addClassToNodes,
    createNodes: createNodes,
    createNodesFromRNodes: createNodesFromRNodes,
    createParentNodesIE: createParentNodesIE,
    createParentNodesMG: createParentNodesMG,
    positionNodesBipartiteGrid: positionNodesBipartiteGrid,
    positionNodesClustered: positionNodesClustered,
    getMinRadius: getMinRadius,
    isNodesArrayFull: isNodesArrayFull
};
