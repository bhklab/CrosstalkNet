'use strict';

angular.module('myApp.CytoCtrl', ['ngRoute']).controller('CytoCtrl', ['$scope', 'RESTService', 'GraphConfigService', '$q', '$timeout', function($scope, RESTService, GraphConfigService, $q, $timeout) {
    var elements = [];
    var totalNumNodes = 1000;

    $scope.selectedItem = null;
    $scope.searchText = "";
    $scope.display = "";

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
        return $q(function(resolve, reject) {
            RESTService.get('test-correlation').then(function(data) {
                var elements = [];
                var epiNodes = DataService.createNodes(data.epiNodes, 'epi', 1);
                var stromaNodes = DataService.createNodes(data.stromaNodes, 'stroma', 2);
                var edges = DataService.createEdges(data.epiNodes, data.stromaNodes, data.weights);

                elements = elements.concat(epiNodes);
                elements = elements.concat(stromaNodes);
                elements = elements.concat(edges);
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

                console.log(data);
                resolve(elements);
            });
        })

    };

    $scope.createConfig = function(elements) {
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

        return initialConfig;
        //$scope.applyConfig(initialConfig);
    };

    $scope.applyConfig = function(config) {
        $scope.cy = cytoscape(config);
        $scope.cy.fit($scope.cy.$("*"), 10);

        $scope.cy.on("zoom", function() {
            $scope.$evalAsync(function() {
                if ($scope.cy.zoom() < 0.25) {
                    $scope.cy.elements = topLevelElements;
                } else {

                }
                $scope.zoom = $scope.cy.zoom();
            });
        });

        $scope.cy.on("select", function(evt) {
            var node = evt.cyTarget;
            var id = node.id();
            console.log('tapped ' + id);

            $scope.cy.edges().forEach(function(edge) {
                if (edge.source().id() == id) {
                    /*
                    edge.addClass('highlighted');
                    edge.removeClass('faded');*/
                    edge.css({ 'line-color': 'red' });
                } else {
                    /*edge.addClass('faded');
                    edge.removeClass('highlighted');*/
                    edge.css({ 'opacity': '0' });
                }
            });

            $scope.selectedItem = null;
            console.log(node);
        });

        $scope.cy.on("unselect", function(evt) {
            var node = evt.cyTarget;
            var id = node.id();

            $scope.resetEdges();
            console.log('tapped ' + id);
            console.log(node);
        });
    };

    $scope.resetEdges = function() {
        $scope.cy.edges().forEach(function(edge) {
            edge.css({ 'line-color': 'white' });
            edge.css({ 'opacity': '1' });
        });
    }

    $scope.loadAll = function() {
        var genes = [];
        $scope.cy.nodes().forEach(function(node) {
            genes.push(node.id());
        });

        return genes.map(function(gene) {
            return {
                value: gene.toLowerCase(),
                display: gene
            };
        });
    };


    $scope.querySearch = function(query) {
        var results = query ? $scope.genes.filter(createFilterFor(query)) : $scope.genes,
            deferred;
        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function() { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    };

    $scope.selectedItemChanged = function(item) {
        // Run code to select gene here
        // We probably need 2 dropdowns, one for epi and one for stroma or maybe a swtich to indicate which one we are searching
        var node = $scope.cy.$('#' + item.value);
        node.select();
        var id = node.id();
        console.log('tapped ' + id);
        $scope.resetEdges(); 
        
        $scope.cy.edges().forEach(function(edge) {
            if (edge.source().id() == id) {
                /*
                edge.addClass('highlighted');
                edge.removeClass('faded');*/
                edge.css({ 'line-color': 'red' });
            } else {
                /*edge.addClass('faded');
                edge.removeClass('highlighted');*/
                edge.css({ 'opacity': '0' });
            }
        });

        $scope.selectedItem = null;
        console.log(node);
        console.log(item);
    };



    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    $(document).ready(function() {
        $scope.getData().then(function(elements) {
            var config = $scope.createConfig(elements);
            $scope.applyConfig(config);

            $scope.genes = $scope.loadAll();

        });
    });

}]);
