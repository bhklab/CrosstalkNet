'use strict'

var clone = require('clone');

function positionCommunitiesRandom(nodes, nodeSize) {
    nodes = clone(nodes);
    var totalNodes = 0;
    var circleModel = {
        x: 0,
        y: 0,
        radius: 0
    }
    var placedCircles = [];

    for (var i = 0; i < nodes.length; i++) {
        totalNodes += nodes[i].length;
    }

    var totalArea = totalNodes * (nodeSize * nodeSize) * Math.PI * 10;
    var containerRadius = Math.sqrt(totalArea / Math.PI);

    for (var i = nodes.length - 1; i >= 0; i--) {
        var mainRadius = Math.floor((Math.random() * containerRadius) + 1);
        var mainAngle = Math.random() * 2 * Math.PI;

        var centerPoint = {
            x: mainRadius * Math.cos(mainAngle),
            y: mainRadius * Math.sin(mainAngle)
        };

        var withinClusterArea = nodes[i].length * (nodeSize * nodeSize) * Math.PI * 4;
        var withinClusterMaxRadius = Math.sqrt(withinClusterArea / Math.PI);
        var avoidOverlapIterations = 0;

        centerPoint = avoidOverlap(centerPoint, withinClusterMaxRadius, containerRadius, placedCircles);

        for (var j = 0; j < nodes[i].length; j++) {
            var randomWithinClusterRadius = Math.floor((Math.random() * withinClusterMaxRadius) + 1);
            var randomWithinClusterAngle = Math.random() * 2 * Math.PI;

            nodes[i][j].position = {
                x: centerPoint.x + (randomWithinClusterRadius * Math.cos(randomWithinClusterAngle)),
                y: centerPoint.y + (randomWithinClusterRadius * Math.sin(randomWithinClusterAngle))
            };
        }

        var placedCircle = clone(circleModel);
        placedCircle.x = centerPoint.x;
        placedCircle.y = centerPoint.y;
        placedCircle.radius = withinClusterMaxRadius + 120;

        placedCircles.push(placedCircle);

    }

    return nodes;
}

function avoidOverlap(centerPoint, clusterRadius, containerRadius, placedCircles) {
    var avoidOverlapIterations = 0;
    var isOverlapping = false;
    var mainAngle = 0;
    var mainRadius = 0;

    centerPoint = clone(centerPoint);

    while (avoidOverlapIterations < 1000) {
        var isOverlapping = false;

        for (var k = 0; k < placedCircles.length; k++) {
            var r0 = clusterRadius;
            var r1 = placedCircles[k].radius;

            var x0 = centerPoint.x;
            var y0 = centerPoint.y;

            var x1 = placedCircles[k].x;
            var y1 = placedCircles[k].y;

            if (Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2) <= Math.pow(r0 + r1, 2)) {
                isOverlapping = true;
            }
        }

        if (isOverlapping == false) {
            break;
        }
        mainRadius = Math.floor((Math.random() * containerRadius) + 1);
        mainAngle = Math.random() * 2 * Math.PI;

        centerPoint = {
            x: mainRadius * Math.cos(mainAngle),
            y: mainRadius * Math.sin(mainAngle)
        };

        avoidOverlapIterations++;
    }

    console.log("avoidOverlapIterations: " + avoidOverlapIterations);

    return centerPoint;

}

module.exports = {
    positionCommunitiesRandom: positionCommunitiesRandom
}
