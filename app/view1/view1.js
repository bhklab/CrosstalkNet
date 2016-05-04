'use strict';

angular.module('myApp.CytoCtrl', ['ngRoute']).controller('CytoCtrl', ['$scope', 'RESTService', 'GraphConfigService', '$q', '$timeout', function($scope, RESTService, GraphConfigService, $q, $timeout) {
    var elements = [];
    var totalNumNodes = 1000;

    $scope.selectedItem = null;
    $scope.searchText = "";
    $scope.display = "";

    var elemCopy = angular.copy(elements);

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
            	console.log(data.edges);
            	/*
                var elements = [];
                var epiNodes = GraphConfigService.createNodes(data.epiNodes, 'epi', 1);
                var stromaNodes = GraphConfigService.createNodes(data.stromaNodes, 'stroma', 2);
                var edges = GraphConfigService.createEdges(data.epiNodes, data.stromaNodes, data.weights);

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

                console.log(data);*/
                resolve(data.config);
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
        if (item == null) {
        	return;
        }

        $scope.cy.nodes().unselect();
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


    $scope.resize = GraphConfigService.resetZoom;
    
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    $(document).ready(function() {
        $scope.getData().then(function(config) {
            //var config = GraphConfigService.createConfig(elements);
            console.log(config.elements);
            GraphConfigService.applyConfig(config);
            $scope.cy = GraphConfigService.data.cy;
            $scope.genes = $scope.loadAll();

        });
    });

}]);
