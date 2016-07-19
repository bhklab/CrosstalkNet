'use strict'

var styleUtils = require('./styleUtils');
var clone = require('clone');

var classes = [];
for (var key in styleUtils.classSuffixes) {
    var value = styleUtils.classSuffixes[key];
    classes.push(value);
}

function createAllClasses(prefix) {
    var classesString = '';
    var classesConcatenated = classes.map(function(suffix) {
        return prefix + "-" + suffix;
    });

    classesString = classesConcatenated.join(" ");

    return classesString;
}

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

function createNodes(nodes, parent, column, degrees, neighbourLevel) {
    var resultNodes = [];

    for (var i = 0; i < nodes.length; i++) {
        var parentFromNode = nodes[i].endsWith('-E') ? "epi" : "stroma";
        resultNodes.push({
            data: {
                id: nodes[i],
                degree: degrees[i],
                parent: parent == null ? parentFromNode : parent,
                neighbourLevel: neighbourLevel
            },
            classes: parentFromNode + " " + createAllClasses(parentFromNode)
        });
    }

    return resultNodes;
}

function createNodesFromRNodes(rNodes, forExplorer) {
    var resultNodes = [];

    for (var i = 0; i < rNodes.length; i++) {
        var parentFromNode = rNodes[i].name.endsWith('-E') ? "epi" : "stroma";
        resultNodes.push({
            data: {
                id: rNodes[i].name,
                degree: rNodes[i].degree,
                parent: forExplorer == true ? 'par' + rNodes[i].level : parentFromNode,
                neighbourLevel: rNodes[i].level,
                isSource: rNodes[i].isSource,
                type: parentFromNode
            },
            classes: parentFromNode + " " + createAllClasses(parentFromNode)
        });
    }

    return resultNodes;
}

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

function positionNodesBipartiteGrid(nodes) {
    nodes = clone(nodes);

    for (var j = 0; j < nodes.length; j++) {
        nodes[j] = positionNodesBipartiteGridHelper(nodes[j]);
    }

    return nodes;
}

function isNodesArrayFull(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].length > 0) {
            return 1;
        }
    }

    return 0;
}

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
