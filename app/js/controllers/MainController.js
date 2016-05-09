'use strict';

angular.module('myApp.MainController', ['ngRoute']).controller('MainController', ['$scope', '$rootScope', 'RESTService',
    'GraphConfigService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, $q, $timeout) {
        var totalNumNodes = 1000;

        $scope.selectedItemFirst = null;
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";

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
        $scope.pValueDisplayed = null;
        $scope.pValueActual = null;
        $scope.totalInteractions = null;
        $scope.selfLoops = [];
        $scope.selfLoopsCount = 0;

        $scope.display = "Graph";
        $scope.switchModel = false;
        $scope.layouts = [{ display: "Bipartite", value: "preset" }, { display: "Concentric",
            value: "concentric" }, {display: "Hierarchical", value: "hierarchical"}];
        $scope.selectedLayout = null;


        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Self Loops";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.getDataForOverallGraph = function() {
            $rootScope.state = $rootScope.states.loading;
            return $q(function(resolve, reject) {
                RESTService.get('overall-graph', { params: { pValue: $scope.pValueActual} })
                    .then(function(data) {
                        console.log(data);
                        $rootScope.state = $rootScope.states.loadingConfig;
                        $scope.totalInteractions = data.totalInteractions;
                        resolve(data.config);
                    });
            });
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

            if (source == 'first') {
                $scope.genesSecond = [];
                $rootScope.state = $rootScope.states.loadingFirst;
                RESTService.post('neighbour-general', {
                    gene: item.value.substring(0, item.value
                        .length - 2).toUpperCase(),
                    side: item.value.substring(item.value.length -
                        2),
                    degree: item.object.degree,
                    pValue: $scope.pValueActual,
                    neighbour: 1,
                    layout: $scope.selectedLayout
                }).then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    GraphConfigService.applyConfig(data.config);
                    $scope.cy = GraphConfigService.data.cy;
                    $scope.genesSecond = $scope.loadAll(item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    GraphConfigService.firstDropdownConfig = angular.copy(data.config);
                    $rootScope.state = $rootScope.states.firstDropdown;
                });
            } else {
                var originalElements = GraphConfigService.firstDropdownConfig.elements;
                $rootScope.state = $rootScope.states.loadingSecond;
                RESTService.post('neighbour-general', {
                    gene: item.value.substring(0, item.value
                        .length - 2).toUpperCase(),
                    side: item.value.substring(item.value.length -
                        2),
                    originalElements: originalElements,
                    pValue: $scope.pValueActual,
                    neighbour: 2,
                    layout: $scope.selectedLayout
                }).then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    GraphConfigService.applyConfig(data.config);
                    $scope.cy = GraphConfigService.data.cy;
                    //$scope.genesSecond = $scope.loadAll(item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    $rootScope.state = $rootScope.states.secondDropdown;
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

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
        };

        $scope.refreshOverallGraph = function() {
            $scope.pValueActual = $scope.pValueDisplayed;
            $scope.resetAllData();
            $scope.resetInputFields();
            $scope.getSelfLoops();
            GraphConfigService.firstDropdownConfig = null;
            $scope.getDataForOverallGraph().then(function(config) {
                //var config = GraphConfigService.createConfig(elements);
                console.log(config.elements);
                $rootScope.state = $rootScope.states.loadingConfig;
                GraphConfigService.applyConfig(config);
                $scope.cy = GraphConfigService.data.cy;
                $scope.genesFirst = $scope.loadAll();
                $rootScope.state = $rootScope.states.initial;
            });
        };

        $(document).ready(function() {
            $scope.refreshOverallGraph();
        });
    }
]);
