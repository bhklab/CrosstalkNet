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
function createNodesFromRNodes(rNodes, parent) {
    var resultNodes = [];



    for (var i = 0; i < rNodes.length; i++) {
        var parentFromNode = rNodes[i].name.endsWith('-E') ? "epi" : "stroma";
        resultNodes.push({
            data: {
                id: rNodes[i].name,
                degree: rNodes[i].degree,
                parent: parent + rNodes[i].level,
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
        if (i < 1 || nodes[i - 1].length > 0) {
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
function createParentNodesMG(prefix, number) {
    var parentNodes = [];

    for (var i = 0; i < number; i++) {
        parentNodes.push({
            data: {
                id: prefix + i
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
        nodes = [nodes];
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
 * @param {Number} clusterNumber A number representing which cluster is currently being created. This is used 
 * to position clusters around each.
 * @param {Number} totalClusters The total amount of clusters that the graph will have. This is simply the number 
 * of total selected genes.
 * @param {Number} nodeRadius The average radius of each node in pixels. This will be used to determine the radii
 * of the disks for this particular cluster.
 * @param {Number} largestClusterRadius The radius of the largest cluster for the group of clusters being created.
 * This is used to create a proper amount of separation between clusters.
 * @return {Object} The selected gene, firstNeighbours, and secondNeighbours with the clustered position added to them.
 */
function positionNodesClustered(selectedGene, firstNeighbours, secondNeighbours, clusterNumber, totalClusters, nodeRadius, largestClusterRadius, fudge) {
    var mainRadius = Math.max((totalClusters * (largestClusterRadius * 2) * 1.3) / (2 * Math.PI), largestClusterRadius + 100);
    var firstNeighbourRadius = getMinRadius(firstNeighbours.length, nodeRadius, fudge, 120);
    var secondNeighbourRadius = firstNeighbourRadius + getMinRadius(secondNeighbours.length, nodeRadius, fudge, 120);

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

function positionCommunities(nodes, allNodes, clusterNumber, totalClusters, nodeRadius, clusterRadii, fudge) {
    var radius = clusterRadii[clusterNumber];

    nodes = clone(nodes);

    var x = 0;
    var top = 0;
    var bottom = 0;

    for (var i = 2; i < clusterNumber - 1; i++) {
        if (i % 2 == 1) {
            bottom += 2.5 * clusterRadii[i];
        } else {
            top += 2.5 * clusterRadii[i];
        }
    }

    if (clusterNumber % 2 == 1 && clusterNumber > 2 && clusterNumber < clusterRadii.length - 1) {
        bottom += Math.max(clusterRadii[clusterNumber - 1], clusterRadii[clusterNumber])
        top += Math.max(clusterRadii[clusterNumber - 1], clusterRadii[clusterNumber])
    } else if (clusterNumber % 2 == 0 && clusterNumber > 2 && clusterNumber < clusterRadii.length - 1) {
        top += Math.max(clusterRadii[clusterNumber], clusterRadii[clusterNumber + 1]);
        bottom += Math.max(clusterRadii[clusterNumber], clusterRadii[clusterNumber + 1]);
    }

    // if (clusterNumber > 1) {
    //     if (clusterNumber % 2 == 1 && clusterNumber > 2) {
    //         if (clusterNumber < clusterRadii.length - 1) {
    //             bottom += allNodes[clusterNumber - 2][0].position.x + 3 * Math.max(clusterRadii[clusterNumber - 1], clusterRadii[clusterNumber]);
    //             top += allNodes[clusterNumber - 3][0].position.x + 3 * Math.max(clusterRadii[clusterNumber - 1], clusterRadii[clusterNumber]);
    //         } else {
    //             bottom += allNodes[clusterNumber - 2][0].position.x + 3 * clusterRadii[clusterNumber];
    //             top += allNodes[clusterNumber - 3][0].position.x + 3 * clusterRadii[clusterNumber];
    //         }
    //     } else {
    //         if (clusterNumber < clusterRadii.length - 1) {
    //             bottom += allNodes[clusterNumber - 1][0].position.x + 3 * Math.max(clusterRadii[clusterNumber], clusterRadii[clusterNumber + 1]);
    //             top += allNodes[clusterNumber - 2][0].position.x + 3 * Math.max(clusterRadii[clusterNumber], clusterRadii[clusterNumber + 1]);
    //         } else {
    //             bottom += allNodes[clusterNumber - 1][0].position.x + 3 * clusterRadii[clusterNumber];
    //             top += allNodes[clusterNumber - 2][0].position.x + 3 * clusterRadii[clusterNumber];
    //         }
    //     }
    // }

    var buffer = 0;

    if (clusterNumber % 2 == 1) {
        buffer = clusterRadii[clusterNumber] < 100 || clusterRadii[clusterNumber - 1] < 100 ? 200 : 0;
    } else {
        buffer = clusterRadii[clusterNumber] < 100 ? 200 : 0;
    }

    x = Math.max(top, bottom);

    var center = {
        x: x + buffer,
        y: Math.round(clusterNumber % 2) * (2 * clusterRadii[clusterRadii.length - 1] + 100)
    }

    for (var i = 0; i < nodes.length; i++) {
        var angle = ((2 * Math.PI) / nodes.length) * (i + 1);
        nodes[i].position = {
            x: (radius * Math.cos(angle)) + center.x,
            y: (radius * Math.sin(angle)) + center.y
        };
    }

    return {
        nodes: nodes
    };
}

function positionCommunitiesRandom(centerNode, nodes, allNodes, clusterNumber, totalClusters, nodeRadius, clusterRadii, fudge) {
    var radius = clusterRadii[clusterNumber];
    var totalNodes = 0;

    for (var i = 0; i < allNodes.length; i++) {
        totalNodes += allNodes[i].length;
    }

    var totalArea = 0;

    for (var i = 0; i < clusterRadii.length; i++) {
        totalArea += clusterRadii[i] * clusterRadii[i] * 4;
    }

    totalArea *= fudge;

    centerNode = clone(centerNode);
    nodes = clone(nodes);
}

function positionCommunitiesSpiral(allNodes, clusterRadii) {
    allNodes = clone(allNodes);
    var centerCluster = allNodes[allNodes.length - 1];
    var radius = clusterRadii[clusterRadii.length - 1];

    for (var i = 0; i < centerCluster.length; i++) {
        var withinClusterAngle = ((2 * Math.PI) / centerCluster.length) * (i + 1);
        centerCluster[i].position = {
            x: (radius * Math.cos(withinClusterAngle)),
            y: (radius * Math.sin(withinClusterAngle))
        };
    }

    centerCluster[0].position = {x:0, y:0};

    var totalRadius = clusterRadii[clusterRadii.length - 1] + clusterRadii[clusterRadii.length - 2] + 50;
    var arcLength = totalRadius * 2 * Math.PI;
    var lengthUsedSoFar = 0;
    var rings = [];
    var ringRadii = [];
    var ring = 0;

    ringRadii.push(totalRadius);


    // We need to do some kind of lookahead to first see which clusters will need to
    // be placed on a given ring. Once we have that info, we can interate again
    // and detemine the angles for the clusters.

    for (var i = allNodes.length - 2; i >= 0; i--) {
        lengthUsedSoFar += clusterRadii[i] * 2;

        if (lengthUsedSoFar >= arcLength) {
            totalRadius += clusterRadii[i] + clusterRadii[rings[ring][0]] + 50;
            arcLength = totalRadius * 2 * Math.PI;
            lengthUsedSoFar = clusterRadii[i] * 2;
            ringRadii.push(totalRadius);

            rings.push([]);
            ring++;
            rings[ring].push(i);
        } else {
            if (!rings[ring]) {
                rings.push([]);

            }

            rings[ring].push(i);
        }
    }

    console.log("rings %j", rings);
    console.log("ringRadii %j", ringRadii);

    for (var i = 0; i < rings.length; i++) {
        var betweenClusterAngle = 0;
        for (var j = 0; j < rings[i].length; j++) {
            var clusterNumber = rings[i][j];

            // betweenClusterAngle = ((2 * Math.PI) / rings[i].length) * (j + 1);

            var centerPoint = {
                x: ringRadii[i] * Math.cos(betweenClusterAngle),
                y: -ringRadii[i] * Math.sin(betweenClusterAngle)
            };

            betweenClusterAngle += 2 * clusterRadii[clusterNumber] / ringRadii[i];

            console.log("centerPoint: %j", centerPoint);
            // console.log("betweenClusterAngle: %j", betweenClusterAngle);
            console.log("clusterNumber: " + clusterNumber);

            console.log("allNodes[clusterNumber].length: " + allNodes[clusterNumber].length);
            for (var k = 0; k < allNodes[clusterNumber].length; k++) {
                withinClusterAngle = ((2 * Math.PI) / allNodes[clusterNumber].length) * (k + 1);
                allNodes[clusterNumber][k].position = {
                    x: centerPoint.x + (clusterRadii[clusterNumber] * Math.cos(withinClusterAngle)),
                    y: centerPoint.y + (clusterRadii[clusterNumber] * Math.sin(withinClusterAngle))
                };
            }

        }
    }

    return { allNodes: allNodes };


    // First we position the biggest cluster at coordinates 0,0



    // Then we figure out the circumference of that cluster and multiply if by a fudge factor
    // This gives us the circumference of the first ring of cummunities

    // Then we position those communities along the first ring we determined.

    // Then we see what the biggest community was that we placed on this first ring. 
    // The radius of this biggest community plus the radius of the center community,
    // plus some fudge factor 
}

/**
 * @summary Calculates the minimum radius required to display the given
 * number of nodes of the specified size along a circle.
 *
 * @param {Number} numNodes The number of nodes that will be placed in a circular path.
 * @param {Number} nodeRadius The average radius of the nodes being placed.
 * @return {Number} The minimum radius required to display numNodes many nodes of
 * size nodeRadius along a circle with no overlap between nodes.
 */
function getMinRadius(numNodes, nodeRadius, fudge, min) {
    return Math.max((fudge * numNodes * (nodeRadius * 2)) / (2 * Math.PI), min);
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
    isNodesArrayFull: isNodesArrayFull,
    positionCommunities: positionCommunities,
    positionCommunitiesSpiral: positionCommunitiesSpiral
};
