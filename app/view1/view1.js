'use strict';

angular.module('myApp.CytoCtrl', ['ngRoute']).controller('CytoCtrl', ['$scope', 'RESTService',
    'GraphConfigService', '$q', '$timeout',
    function($scope, RESTService, GraphConfigService, $q, $timeout) {
        var elements = [];
        var totalNumNodes = 1000;

        $scope.selectedItemFirst = null;
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.display = "";
        $scope.states = {
            initial: 0,
            firstDropdown: 1,
            secondDropdown: 2,
            loadingFirst: 3,
            loadingSecond: 4
        };

        $scope.minDegree = 0;

        $scope.state = $scope.states.initial;

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
                    console.log(data);

                    resolve(data.config);
                });
            });
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
        };

        $scope.loadAll = function(selectedGene = null) {
            var genes = [];
            var selectedGeneName = selectedGene == null ? '' : ', #' + selectedGene;
            $scope.cy.nodes().not('#epi, #stroma' + selectedGeneName).forEach(function(
                node) {
                /*if (node.id() != 'epi' && node.id() != 'stroma') {
                        
                }*/

                genes.push(node.data());
            });

            return genes.map(function(gene) {
                return {
                    value: gene.id.toLowerCase(),
                    display: gene.id + ' ' + gene.degree,
                    object: gene
                };
            });
        };

        $scope.querySearch = function(query, source) {
            if (source == "first") {
                var results = query ? $scope.genesFirst.filter(createFilterFor(query)) :
                    $scope.genesFirst,
                    deferred;
            } else {
                var results = query ? $scope.genesSecond.filter(createFilterFor(query)) :
                    $scope.genesSecond,
                    deferred;
            }

            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() { deferred.resolve(results); }, Math.random() *
                    1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        };

        $scope.selectedItemChanged = function(item, source) {
            // Run code to select gene here
            // We probably need 2 dropdowns, one for epi and one for stroma or maybe a swtich to indicate which one we are searching
            if (item == null) {
                return;
            }

            if (source == 'first') {
                $scope.state = $scope.states.loading;
                RESTService.post('first-dropdown', {
                    gene: item.value.substring(0, item.value
                        .length - 2),
                    side: item.value.substring(item.value.length -
                        2),
                    degree: item.object.degree
                }).then(function(data) {
                    console.log(data);
                    GraphConfigService.applyConfig(data.config);
                    $scope.cy = GraphConfigService.data.cy;
                    $scope.genesSecond = $scope.loadAll(item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    GraphConfigService.firstDropdownConfig = angular.copy(data.config);
                    $scope.state = $scope.states.firstDropdown;
                });
            } else {
                var originalElements = GraphConfigService.firstDropdownConfig.elements;
                $scope.state = $scope.states.loading;
                RESTService.post('second-dropdown', {
                    gene: item.value.substring(0, item.value
                        .length - 2),
                    side: item.value.substring(item.value.length -
                        2),
                    originalElements: originalElements
                }).then(function(data) {
                    console.log(data);

                    GraphConfigService.applyConfig(data.config);
                    $scope.cy = GraphConfigService.data.cy;
                    //$scope.genesSecond = $scope.loadAll(item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    $scope.state = $scope.states.secondDropdown;
                });
            }

        };

        $scope.resize = GraphConfigService.resetZoom;

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(gene) {
                return (gene.value.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.resetData = function() {
            GraphConfigService.firstDropdownConfig = null;
            $scope.state = $scope.states.initial;
            $scope.getData().then(function(config) {
                //var config = GraphConfigService.createConfig(elements);
                console.log(config.elements);
                GraphConfigService.applyConfig(config);
                $scope.cy = GraphConfigService.data.cy;
                $scope.genesFirst = $scope.loadAll();

            });
        };

        $(document).ready(function() {
            $scope.resetData();
        });
    }
]);
