var myModule = angular.module("myApp");
myModule.factory('GraphConfigService', function($http) {

    var service = {};

    service.data = { cy: null };
    service.elemCopy = [];
    service.firstDropdownConfig = null;

    service.createNodes = function(nodes, parent, column = 1) {
        var resultNodes = [];

        for (var i = 0; i < nodes.length; i++) {
            resultNodes.push({
                data: {
                    id: nodes[i].name,
                    parent: parent
                },
                position: {
                    x: 100 * column,
                    y: 100 + (i * 25)
                },
                style: {
                    'width': (10 + nodes[i].degree) + 'px',
                    'height': (10 + nodes[i].degree) + 'px',
                    'text-halign': column == 1 ? "left" : "right",
                    'text-valign': 'center'
                }
            })
        }

        return resultNodes;
    };

    service.createEdges = function(epiNodes, stromaNodes, weights) {
        var edges = [];

        for (var i = 0; i < epiNodes.length; i++) {
            for (var j = i + 1; j < stromaNodes.length; j++) {
                if (weights[i][j] > 0) {
                    edges.push({
                        data: {
                            id: 'EpiToStroma' + i + j,
                            source: epiNodes[i].name,
                            target: stromaNodes[j].name
                        },
                        style: {
                            'label': 'data(label)' // maps to data.label
                        }
                    });
                }

                if (weights[j][i] > 0) {
                    edges.push({
                        data: {
                            id: 'StromaToEpi' + i + j,
                            source: stromaNodes[i].name,
                            target: epiNodes[j].name
                        },
                        style: {
                            'label': 'data(label)' // maps to data.label
                        }
                    });
                }
            }
        }

        return edges;
    };

    service.createConfig = function(elements) {
        var initialConfig = {

            container: document.getElementById('cy'),

            elements: elements,
            layout: {
                name: 'preset'
            },
            style: [{
                selector: 'node',
                style: {
                    'content': 'data(id)',
                    'font-size': '8px'
                }
            }, {
                selector: ':parent',
                style: {
                    'background-opacity': 0.6
                }
            }, {
                selector: 'node:selected',
                style: {
                    'background-color': 'red'
                }
            }]
        };

        service.elemCopy = angular.copy(elements);
        return initialConfig;
        //$scope.applyConfig(initialConfig);
    };

    service.applyConfig = function(config) {
        service.elemCopy = angular.copy(config.elements);
        config.container = document.getElementById('cy');
        service.data.cy = cytoscape(config);
        service.data.cy.fit(service.data.cy.$("*"), 10);

        /*
        service.cy.on("zoom", function() {
            service.$evalAsync(function() {
                if service.cy.zoom() < 0.25) {
                    service.cy.elements = topLevelElements;
                } else {

                }
                service.zoom = service.cy.zoom();
            });
        });*/


        service.data.cy.on("select", function(evt) {
            var node = evt.cyTarget;
            var id = node.id();
            console.log('tapped ' + id);


            service.data.cy.edges().forEach(function(edge) {
                if (edge.source().id() == id) {
                    edge.addClass('highlighted');
                    edge.removeClass('faded');
                    edge.css({ 'line-color': 'red' });
                } else {
                    edge.addClass('faded');
                    edge.removeClass('highlighted');
                    edge.css({ 'opacity': '0' });
                }
            });

            service.selectedItem = null;
            console.log(node);
        });

        /*
        service.data.cy.on("unselect", function(evt) {
            var node = evt.cyTarget;
            var id = node.id();

            service.resetEdges();
            console.log('tapped ' + id);
            console.log(node);
        });*/
    };

    service.resetEdges = function() {
        service.data.cy.edges().forEach(function(edge) {
            edge.css({ 'line-color': 'white' });
            edge.css({ 'opacity': '1' });
        });
    };

    service.resetZoom = function() {
        service.resetNodes();
        service.data.cy.fit(service.data.cy.$("*"), 10);
    };

    service.resetNodes = function() {
        for (var i = 0; i < service.elemCopy.length; i++) {
            if (service.elemCopy[i].target == null) {
                if (service.elemCopy[i].position != null) {
                    service.data.cy.$("#" + service.elemCopy[i].data.id).position({ x: service
                            .elemCopy[i].position.x, y: service.elemCopy[i].position
                            .y });
                }
            }
        }
    };

    service.createLargeWeaveGraph = function() {
        var elements = [];

        for (var i = 0; i < totalNumNodes; i++) {
            elements.push({
                data: {
                    id: 'nodeA' + i,
                    parent: 'epi'
                },
                position: {
                    x: i < (totalNumNodes / 2) ? 100 + (i * 10) : 100 + ((
                        totalNumNodes - i) * 10),
                    y: 100 + (i * 15)
                },
                style: {
                    'shape': 'triangle'
                }

            });
            elements.push({
                data: {
                    id: 'nodeB' + i,
                    parent: 'stroma'
                },
                position: {
                    x: i < (totalNumNodes / 2) ? 15000 - (i * 10) : 1500 - ((
                        totalNumNodes - i) * 10),
                    y: 100 + (i * 15)
                }
            });
            elements.push({
                data: {
                    id: 'edgeAB' + i,
                    source: 'nodeA' + i,
                    target: 'nodeB' + i
                }
            });
        }

        elements.push({
            data: {
                id: 'epi'
            },
            shape: 'TRIANGLE',
            selected: true,
            selectable: true
        })
        elements.push({
            data: {
                id: 'stroma'
            },
            shape: 'TRIANGLE'
        })
    };

    service.create10By10EpiStroma = function() {
        var elements = [];
        totalNumNodes = 10;

        for (var i = 0; i < totalNumNodes; i++) {
            elements.push({
                data: {
                    id: 'nodeA' + i,
                    parent: 'epi'
                },
                position: {
                    x: 100,
                    y: 100 + (i * 15)
                },
                style: {
                    'width': '10px',
                    'height': '10px'
                }

            });
            elements.push({
                data: {
                    id: 'nodeB' + i,
                    parent: 'stroma'
                },
                position: {
                    x: 400,
                    y: 100 + (i * 15)
                }
            });
            elements.push({
                data: {
                    id: 'edgeAB' + i,
                    source: 'nodeA' + i,
                    target: 'nodeB' + i
                }
            });
        }

        elements.push({
            data: {
                id: 'epi'
            },
            shape: 'TRIANGLE',
            selected: true,
            selectable: true
        })
        elements.push({
            data: {
                id: 'stroma'
            },
            shape: 'TRIANGLE'
        })
    };



    return service;
});
