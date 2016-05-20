'use strict';

angular.module('myApp.MainController', ['ngRoute']).controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, $q,
        $timeout) {
        $rootScope.selectedTab = 0;
        $scope.selectedItemFirst = null;
        $scope.selectedZoomGene = null;
        $scope.searchTextZoom = "";
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.minPositiveWeight = 0;
        $scope.minNegativeWeight = 0;
        $scope.ctrl = "main";

        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.pValues = angular.copy(BasicDataService.pValues);
        $scope.layouts = angular.copy(BasicDataService.layouts);

        $scope.minDegree = {
            first: 0,
            second: 0
        }
        $rootScope.state = $rootScope.states.initial;

        $scope.pValueDisplayed = $scope.pValues[2].value;
        $scope.pValueActual = $scope.pValues[2].value;
        $scope.totalInteractions = null;

        $scope.display = "Graph";
        $scope.switchModel = false;

        $scope.selectedLayout = $scope.layouts[0].value;

        $scope.sliderMinWeightNegative = -1;
        $scope.sliderMaxWeightPositive = 1;

        $scope.correlationFilterFirst = {
            min: -1,
            max: 1,
            negativeFilter: 0,
            positiveFilter: 0,
            negativeEnabled: false,
            positiveEnabled: false
        };

        $scope.correlationFilterSecond = {
            min: -1,
            max: 1,
            negativeFilter: 0,
            positiveFilter: 0,
            negativeEnabled: false,
            positiveEnabled: false
        };

        $scope.negativeFilterEnabled = false;
        $scope.positiveFilterEnabled = false;

        $scope.data = GraphConfigService.tabs.main.data;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;
        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        $scope.loadGeneListDropdownOptions = BasicDataService.loadGeneListDropdownOptions;
        $scope.querySearch = BasicDataService.querySearch;
        $scope.genesOfInterest = [];

        $scope.getInteractingNodes = GraphConfigService.getInteractingNodes;

        $scope.getNodesWithMinDegree = BasicDataService.getNodesWithMinDegree;

        $scope.applyConfig = GraphConfigService.applyConfig;

        $scope.getSelfLoops = BasicDataService.getSelfLoops;
        $scope.edges = 0;
        $scope.nodes = 0;
        $scope.displaySecondNeighbours = true;

        $scope.GOIStates = {
            initial: 0,
            filterFirst: 1,
            getSecondNeighbours: 2,
            filterSecond: 3
        };

        $scope.GOIState = $scope.GOIStates.initial;

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Self Loops";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.selectedItemChanged = function(item, source) {
            // Run code to select gene here
            // We probably need 2 dropdowns, one for epi and one for stroma or maybe a swtich to indicate which one we are searching
            if (item == null) {
                return;
            }

            GraphConfigService.firstSelectedGene = item.value;
            $rootScope.selectedTab = 1;
            RESTService.post('neighbour-general', {
                selectedGenes: item.value.toUpperCase(),
                pValue: $scope.pValueActual,
                layout: $scope.selectedLayout
            }).then(function(data) {
                console.log(data);
                $rootScope.state = $rootScope.states.loadingConfig;
                //$scope.applyConfig(data.config, "cyMain");
                //$scope.genesSecond = $scope.loadDropdownOptions($scope.cy,
                //    item.value);
                $scope.neighbours = angular.copy($scope.genesSecond);
                GraphConfigService.neighbourConfigs.firstDropdownConfig =
                    angular.copy(data.config);
                $rootScope.state = $rootScope.states.firstDropdown;
            });
        };

        $scope.resize = GraphConfigService.resetZoom;

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
            $scope.genesOfInterest = [];
            $scope.sliderMinWeightNegative = 1;
            $scope.sliderMaxWeightPositive = 1;
            $scope.elemCopy = null;
            $scope.styleCopy = null;
        };

        $scope.searchForGene = function(gene) {
            if (gene != null) {
                //$scope.findGeneInGraph($scope.cy, gene.value);

                if ($scope.genesOfInterest.indexOf(gene.value) < 0) {
                    $scope.genesOfInterest.push(gene.value);
                }
            }
        };

        $scope.removeGenesOfInterest = function() {
            $scope.genesOfInterest = [];
        };

        $scope.getRelevantGenes = function(filter) {
            var filterFirst = false;
            var filterSecond = false;
            var depth = 1;

            if ($scope.GOIState == $scope.GOIStates.filterFirst) {
                if (filter == false) {
                    depth = 2;
                } 
                filter = true;
                filterFirst = $scope.correlationFilterFirst.negativeEnabled || $scope.correlationFilterFirst.positiveEnabled;
            } else if ($scope.GOIState == $scope.GOIStates.getSecondNeighbours) {
                filterFirst = $scope.correlationFilterFirst.negativeEnabled || $scope.correlationFilterFirst.positiveEnabled;
                filterSecond = $scope.correlationFilterSecond.negativeEnabled || $scope.correlationFilterSecond.positiveEnabled;
                depth = 2;
            }

            RESTService.post("submatrix", {
                    pValue: $scope.pValueActual,
                    genes: $scope.genesOfInterest,
                    minNegativeWeightFirst: $scope.correlationFilterFirst.negativeFilter ==
                        null || !$scope.correlationFilterFirst.negativeEnabled ?
                        "NA" : $scope.correlationFilterFirst.negativeFilter,
                    minPositiveWeightFirst: $scope.correlationFilterFirst.positiveFilter ==
                        null || !$scope.correlationFilterFirst.positiveEnabled ?
                        "NA" : $scope.correlationFilterFirst.positiveFilter,
                    minNegativeWeightSecond: $scope.correlationFilterSecond.negativeFilter ==
                        null || !$scope.correlationFilterSecond.negativeEnabled ?
                        "NA" : $scope.correlationFilterSecond.negativeFilter,
                    minPositiveWeightSecond: $scope.correlationFilterSecond.positiveFilter ==
                        null || !$scope.correlationFilterSecond.positiveEnabled ?
                        "NA" : $scope.correlationFilterSecond.positiveFilter,
                    filterFirst: filterFirst && filter,
                    filterSecond: filterSecond && filter,
                    layout: $scope.selectedLayout,
                    depth: depth
                })
                .then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    $scope.totalInteractions = data.totalInteractions;
                    if ($scope.GOIState == $scope.GOIStates.initial) {//filtered != 'yes') {
                        $scope.correlationFilterFirst.min = data.minNegativeWeight;
                        $scope.correlationFilterFirst.max = data.maxPositiveWeight;
                    }
                    $scope.applyConfig(data.config, "cyMain", $scope);
                    $scope.firstNeighbourDropdownOptions = $scope.loadDropdownOptions($scope.cy, []);

                    if ($scope.GOIState == $scope.GOIStates.initial) {
                        $scope.GOIState = $scope.GOIStates.filterFirst;
                    } else if ($scope.GOIState == $scope.GOIStates.filterFirst && depth == 2) {
                        $scope.GOIState = $scope.GOIStates.getSecondNeighbours;
                    }
                });
        };

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
        };

        $scope.getGeneList = function() {
            RESTService.get('gene-list', { params: { pValue: $scope.pValueActual } })
                .then(function(data) {
                    $scope.geneList = $scope.loadGeneListDropdownOptions(data.geneList);
                });
        };

        $scope.getGeneList();
    }
]);
