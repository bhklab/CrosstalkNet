// Contains utility functions for creating, styling, and positioning nodes

module.exports = {
    addPositionsToNodes: function(nodes, initialX, initialY, xPattern, yPattern) {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].position = {
                x: initialX + (i * xPattern),
                y: initialY + (i * yPattern)
            };
        }

        return nodes;
    },
    addStyleToNodes: function(nodes, width, height, textHAlign, textVAlign, backgroundColor) {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].style = {
                'width': width + 'px',
                'height': height + 'px',
                'text-halign': textHAlign,
                'text-valign': textVAlign,
                'background-color': backgroundColor
            }
        }

        return nodes;
    },
    createNodes: function(nodes, parent, column, degrees) {
        var resultNodes = [];
        var sideFlag = ""; //parent == "epi" || parent == "epiRight" ? "-e" : "-s";

        if (parent == "epi") {
            sideFlag = "-e";
        } else if (parent == "epiRight") {
            sideFlag = "-er";
        } else if (parent == "stroma") {
            sideFlag = "-s";
        } else if (parent = "stromaRight") {
            sideFlag = "-sr";
        }

        for (var i = 0; i < nodes.length; i++) {
            resultNodes.push({
                data: {
                    id: nodes[i] + sideFlag,
                    degree: degrees[i],
                    parent: parent
                }
                /*,
                            position: {
                                x: 100 * column,
                                y: 100 + (i * 20)
                            },
                            style: {
                                'width': '10px', //(10 + nodes[i].degree) + 'px',
                                'height': '10px', //(10 + nodes[i].degree) + 'px',
                                'text-halign': column == 1 ? "left" : "right",
                                'text-valign': 'center',
                                'background-color': color
                            }*/
            })
        }

        return resultNodes;
    }
};
