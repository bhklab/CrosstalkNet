'use strict';

angular.module('myApp.NeighbourController', ['ngRoute']).controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, $q, $timeout) {
        $rootScope.selectedTab = 0;
        $scope.selectedItemFirst = null;
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.ctrl = "neighbour";

        $rootScope.states = {
            initial: 0,
            firstDropdown: 1,
            secondDropdown: 2,
            loadingFirst: 3,
            loadingSecond: 4,
            loading: 5,
            loadingConfig: 6
        };

        $scope.minDegree = {
            first: 0,
            second: 0
        }
        $rootScope.state = $rootScope.states.initial;
        $scope.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
            { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
        ];
        $scope.pValueDisplayed = $scope.pValues[2].value;
        $scope.pValueActual = $scope.pValues[2].value;
        $scope.totalInteractions = null;
        $scope.selfLoops = [];
        $scope.selfLoopsCount = 0;

        $scope.display = "Graph";
        $scope.switchModel = false;
        $scope.layouts = [{ display: "Bipartite", value: "preset" }, {
            display: "Concentric",
            value: "concentric"
        }, { display: "Hierarchical", value: "hierarchical" }];
        $scope.selectedLayout = $scope.layouts[1].value;


        $scope.applyConfig = function(config, containerID) {
            $scope.elemCopy = angular.copy(config.elements);
            config.container = document.getElementById(containerID);
            $scope.cy = cytoscape(config);
            $scope.cy.fit($scope.cy.$("*"), 10);
        }

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Self Loops";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.getSelfLoops = function() {
            RESTService.get('self-loops', { params: { pValue: $scope.pValueActual } })
                .then(function(data) {
                    console.log(data);
                    $scope.selfLoops = data.geneNames;
                    $scope.selfLoopsCount = data.numberOfLoops;
                });
        };

        $scope.loadAll = function(selectedGene = null) {
            var genes = [];
            var selectedGeneName = selectedGene == null ? '' : ', #' + selectedGene.toUpperCase();
            $scope.cy.nodes().not('#epi, #stroma' + selectedGeneName).forEach(function(
                node) {
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

            var originalElements = GraphConfigService.neighbourConfigs.firstDropdownConfig.elements;
            $rootScope.state = $rootScope.states.loadingSecond;
            RESTService.post('new-neighbour-general', {
                gene: item.value.substring(0, item.value
                    .length - 2).toUpperCase(),
                side: item.value.substring(item.value.length -
                    2),
                originalElements: originalElements,
                pValue: $scope.pValueActual,
                neighbour: 2,
                layout: $scope.selectedLayout,
                first:  GraphConfigService.firstSelectedGene,
                second: item.value.substring(0, item.value
                    .length - 2).toUpperCase()
            }).then(function(data) {
                console.log(data);
                $rootScope.state = $rootScope.states.loadingConfig;
                //$scope.applyConfig(data.config, "cyMain");
                //$scope.genesSecond = $scope.loadAll(item.value);
                $scope.neighbours = angular.copy($scope.genesSecond);
                GraphConfigService.neighbourConfigs.secondDropdownConfig = angular
                    .copy(data.config);
                $rootScope.state = $rootScope.states.secondDropdown;
            });
        };

        $scope.resize = GraphConfigService.resetZoom;

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(gene) {
                return (gene.value.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.$watch('neighbourConfigs.firstDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour");
                $scope.genesFirst = $scope.loadAll();
            }
        });

        $scope.$watch('neighbourConfigs.secondDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour");
            }
        });
    }
]);
