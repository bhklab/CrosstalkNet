'use strict';

angular.module('myApp.CytoCtrl', ['ngRoute']).controller('CytoCtrl', ['$scope', 'RESTService', 'DataService', '$timeout', function($scope, RESTService, DataService, $timeout) {
    var elements = [];
    var totalNumNodes = 1000;


    $scope.createLargeWeaveGraph = function() {
        for (var i = 0; i < totalNumNodes; i++) {
            elements.push({
                data: {
                    id: 'nodeA' + i,
                    parent: 'epi'
                },
                position: {
                    x: i < (totalNumNodes / 2) ? 100 + (i * 10) : 100 + ((totalNumNodes - i) * 10),
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
                    x: i < (totalNumNodes / 2) ? 15000 - (i * 10) : 1500 - ((totalNumNodes - i) * 10),
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

    $scope.create10By10EpiStroma = function() {
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

    $scope.create10By10EpiStroma();
    //$scope.createLargeWeaveGraph();

    var elemCopy = angular.copy(elements);

    var topLevelElements = [{
        data: {
            id: "Top1"
        },
        position: {
            x: 100,
            y: 100
        }
    }, {
        data: {
            id: "Top2"
        },
        position: {
            x: 400,
            y: 100
        }
    }, {
        data: {
            id: "Top3"
        },
        position: {
            x: 100,
            y: 400
        }
    }, {
        data: {
            id: "Top4"
        },
        position: {
            x: 400,
            y: 400
        }
    }];

    var initialConfig = {

        container: document.getElementById('cy'),

        elements: elements
            /*[{ // node n1
					group : 'nodes', // 'nodes' for a node, 'edges' for an edge
					// NB the group field can be automatically inferred for you but specifying it
					// gives you nice debug messages if you mis-init elements

					// NB: id fields must be strings or numbers
					data : { // element data (put dev data here)
					id : 'n1', // mandatory for each element, assigned automatically on undefined
					parent : 'nparent', // indicates the compound node parent id; not defined => no parent
					},

					// scratchpad data (usually temp or nonserialisable data)
					scratch : {
					foo : 'bar'
					},

					position : { // the model position of the node (optional on init, mandatory after)
					x : 100,
					y : 100
					},

					selected : false, // whether the element is selected (default false)

					selectable : true, // whether the selection state is mutable (default true)

					locked : false, // when locked a node's position is immutable (default false)

					grabbable : true, // whether the node can be grabbed and moved by the user

					classes : 'foo bar' // a space separated list of class names that the element has
					},{ // node n2
					data : {
					id : 'n2'
					},
					renderedPosition : {
					x : 300,
					y : 200
					} // can alternatively specify position in rendered on-screen pixels
					},{ // node n3
					data : {
					id : 'n3',
					parent : 'nparent'
					},
					position : {
					x : 123,
					y : 234
					}
					},{ // node nparent
					data : {
					id : 'nparent',
					position : {
					x : 200,
					y : 100
					}
					}
					},{ // edge e1
					data : {
					id : 'e1',
					// inferred as an edge because `source` and `target` are specified:
					source : 'n1', // the source node id (edge comes from this node)
					target : 'n2' // the target node id (edge goes to this node)
					}
					}
					]*/
            ,

        layout: {
            name: 'preset'
        },
        /*
        zoom : 0.8,
        pan : {
        x : 0,
        y : 0
        },*/

        // so we can see the ids etc
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



    $scope.resetZoom = function() {
        $scope.resetNodes();
        $scope.cy.fit($scope.cy.$("*"), 10);
    };

    $scope.resetNodes = function() {
        //cy.load(initialConfig);
        //cy.$("#nodeB7").position({x: 50, y: 50});

        for (var i = 0; i < elemCopy.length; i++) {
            if (elemCopy[i].target == null) {
                if (elemCopy[i].position != null) {
                    $scope.cy.$("#" + elemCopy[i].data.id).position({ x: elemCopy[i].position.x, y: elemCopy[i].position.y });
                }
            }
        }
    };

    $scope.replaceNodes = function() {
        var newElements = [{
            data: {
                id: "new1"
            },
            position: {
                x: 100,
                y: 100
            }
        }, {
            data: {
                id: "new2"
            },
            position: {
                x: 100,
                y: 200
            }
        }];

        elemCopy = newElements;
        $scope.cy.json({ elements: newElements });
    };



    $scope.getData = function() {
        RESTService.get('test-correlation').then(function(data) {
            var elements = [];
            var epiNodes = DataService.createNodes(data.epiNodes, 'epi', 1);
            var stromaNodes = DataService.createNodes(data.stromaNodes, 'stroma', 2);
            var edges = DataService.createEdges(data.weights);

            elements.push(epiNodes);
            elements.push(stromaNodes);
            elements.push(edges);
            elements.push({
                data: {
                    id: 'epi'
                },
                selected: true,
                selectable: true
            })
            elements.push({
                data: {
                    id: 'stroma'
                }
            })

            createConfig(elements);
            console.log(data);
        });
    };

    $scope.createConfig = function(elements) {
        var initialConfig = {

            container: document.getElementById('cy'),

            elements: elements
                /*[{ // node n1
					group : 'nodes', // 'nodes' for a node, 'edges' for an edge
					// NB the group field can be automatically inferred for you but specifying it
					// gives you nice debug messages if you mis-init elements

					// NB: id fields must be strings or numbers
					data : { // element data (put dev data here)
					id : 'n1', // mandatory for each element, assigned automatically on undefined
					parent : 'nparent', // indicates the compound node parent id; not defined => no parent
					},

					// scratchpad data (usually temp or nonserialisable data)
					scratch : {
					foo : 'bar'
					},

					position : { // the model position of the node (optional on init, mandatory after)
					x : 100,
					y : 100
					},

					selected : false, // whether the element is selected (default false)

					selectable : true, // whether the selection state is mutable (default true)

					locked : false, // when locked a node's position is immutable (default false)

					grabbable : true, // whether the node can be grabbed and moved by the user

					classes : 'foo bar' // a space separated list of class names that the element has
					},{ // node n2
					data : {
					id : 'n2'
					},
					renderedPosition : {
					x : 300,
					y : 200
					} // can alternatively specify position in rendered on-screen pixels
					},{ // node n3
					data : {
					id : 'n3',
					parent : 'nparent'
					},
					position : {
					x : 123,
					y : 234
					}
					},{ // node nparent
					data : {
					id : 'nparent',
					position : {
					x : 200,
					y : 100
					}
					}
					},{ // edge e1
					data : {
					id : 'e1',
					// inferred as an edge because `source` and `target` are specified:
					source : 'n1', // the source node id (edge comes from this node)
					target : 'n2' // the target node id (edge goes to this node)
					}
					}
					]*/
                ,

            layout: {
                name: 'preset'
            },
            /*
            zoom : 0.8,
            pan : {
            x : 0,
            y : 0
            },*/

            // so we can see the ids etc
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
    };

    $scope.applyConfig = function(config) {
        $scope.cy = cytoscape(config);
        $scope.cy.fit($scope.cy.$("*"), 10);
        /*cy.reset();*/
        $scope.cy.nodes().forEach(function(n) {
            var g = n.data('name');

            n.qtip({
                content: [{
                    name: 'GeneCard',
                    url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
                }, {
                    name: 'UniProt search',
                    url: 'http://www.uniprot.org/uniprot/?query=' + g + '&fil=organism%3A%22Homo+sapiens+%28Human%29+%5B9606%5D%22&sort=score'
                }, {
                    name: 'GeneMANIA',
                    url: 'http://genemania.org/search/human/' + g
                }].map(function(link) {
                    return '<a target="_blank" href="' + link.url + '">' + link.name + '</a>';
                }).join('<br />\n'),
                position: {
                    my: 'top center',
                    at: 'bottom center'
                },
                style: {
                    classes: 'qtip-bootstrap',
                    tip: {
                        width: 16,
                        height: 8
                    }
                }
            });
        });

        $scope.cy.on("zoom", function() {
            $scope.$evalAsync(function() {
                if ($scope.cy.zoom() < 0.25) {
                    $scope.cy.elements = topLevelElements;
                } else {

                }
                $scope.zoom = $scope.cy.zoom();
            });
        });
    };

    $(document).ready(function() {
    	
    });

}]);
