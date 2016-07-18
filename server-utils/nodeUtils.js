'use strict'

var styleUtils = require('./styleUtils');

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

function addPositionsToNodes(nodes, initialX, initialY, xPattern, yPattern) {
    if (!(nodes instanceof Array)) {
        nodes.position = {
            x: initialX + (xPattern),
            y: initialY + (yPattern)
        };
    } else {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].position = {
                x: initialX + (i * xPattern),
                y: initialY + (i * yPattern)
            };
        }
    }
}

function addStyleToNodes(nodes, width, height, textHAlign, textVAlign, backgroundColor) {
    if (!(nodes instanceof Array)) {
        nodes.style = {
            'width': width + 'px',
            'height': height + 'px',
            'text-halign': textHAlign,
            'text-valign': textVAlign,
            'background-color': backgroundColor
        };
    } else {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style = {
                'width': width + 'px',
                'height': height + 'px',
                'text-halign': textHAlign,
                'text-valign': textVAlign,
                'background-color': backgroundColor
            };
        }
    }
}

function addClassToNodes(nodes, newClass) {
    if (!(nodes instanceof Array)) {
        nodes.classes = nodes.classes + " " + newClass;
    } else {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classes = nodes[i].classes + " " + newClass;
        }
    }
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

        //console.log(parentFromNode + " " + createAllClasses(parentFromNode));
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
                parent: forExplorer == true ? 'par' + rNodes[i].level : parentFromNode, //parent == null ? parentFromNode : parent,
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

function positionNodesBipartite(nodes, epiX, stromaX, epiY, stromaY) {
    var epiIncrement = 0;
    var stromaIncrement = 0;

    for (var i = 0; i < nodes.length; i++) {
        //console.log(nodes[i].classes);
        if (nodes[i].classes != null && nodes[i].classes.indexOf("epi") >= 0) {
            nodes[i].position = {
                x: epiX,
                y: epiY + (30 * epiIncrement)
            };
            epiIncrement++;
        } else {
            nodes[i].position = {
                x: stromaX,
                y: stromaY + (30 * stromaIncrement)
            };
            stromaIncrement++;
        }
    }
}

function positionNodesBipartiteGrid(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.neighbourLevel != -1) {
            nodes[i].data.col = nodes[i].data.neighbourLevel + 1;
        } else {
            nodes[i].data.col = 1;
        }
        nodes[i].data.row = i + 1;
    }
}

function positionNodesClustered(selectedGene, firstNeighbours, secondNeighbours, clusterNumber, totalClusters, nodeRadius, largestClusterRadius) {
    var mainRadius = Math.max((totalClusters * (largestClusterRadius * 2) * 1.3) / (2 * Math.PI), largestClusterRadius + 100);
    var firstNeighbourRadius = getMinRadius(firstNeighbours.length, nodeRadius);
    var secondNeighbourRadius = firstNeighbourRadius + getMinRadius(secondNeighbours.length, nodeRadius);

    // console.log("largestClusterRadius: " + largestClusterRadius);
    // console.log("mainRadius: " + mainRadius);

    var selectedGeneAngle = ((2 * Math.PI) / totalClusters) * (clusterNumber + 1);

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
    addPositionsToNodes: addPositionsToNodes,
    addStyleToNodes: addStyleToNodes,
    addClassToNodes: addClassToNodes,
    createNodes: createNodes,
    createNodesFromRNodes: createNodesFromRNodes,
    createParentNodesIE: createParentNodesIE,
    positionNodesBipartite: positionNodesBipartite,
    positionNodesBipartiteGrid: positionNodesBipartiteGrid,
    positionNodesClustered: positionNodesClustered,
    getMinRadius: getMinRadius
};
