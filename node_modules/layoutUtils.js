'use strict'

function createPresetLayout() {
    var layout = {
        name: "preset"
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

module.exports = {
    createPresetLayout: createPresetLayout,
    createRandomLayout: createRandomLayout
};