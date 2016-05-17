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
        $scope.selfLoops = [];
        $scope.selfLoopsCount = 0;

        $scope.display = "Graph";
        $scope.switchModel = false;

        $scope.selectedLayout = $scope.layouts[0].value;

        $scope.sliderMinWeightNegative = -1;
        $scope.sliderMaxWeightPositive = 1;

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

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Self Loops";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.getDataForOverallGraph = function(path) {
            $rootScope.state = $rootScope.states.loading;
            return $q(function(resolve, reject) {
                RESTService.get(path, {
                        params: {
                            pValue: $scope.pValueActual,
                            minNegativeWeight: $scope.minNegativeWeight ==
                                null || !$scope.negativeFilterEnabled ?
                                "NA" : $scope.minNegativeWeight,
                            minPositiveWeight: $scope.minPositiveWeight ==
                                null || !$scope.positiveFilterEnabled ?
                                "NA" : $scope.minPositiveWeight,
                            layout: $scope.selectedLayout
                        }
                    })
                    .then(function(data) {
                        console.log(data);
                        $rootScope.state = $rootScope.states.loadingConfig;
                        $scope.totalInteractions = data.totalInteractions;
                        $scope.sliderMinWeightNegative = data.minNegativeWeight;
                        $scope.sliderMaxWeightPositive = data.maxPositiveWeight;
                        resolve(data.config);
                    });
            });
        };

        $scope.selectedItemChanged = function(item, source) {
            // Run code to select gene here
            // We probably need 2 dropdowns, one for epi and one for stroma or maybe a swtich to indicate which one we are searching
            if (item == null) {
                return;
            }

            GraphConfigService.firstSelectedGene = item.value;
            $rootScope.selectedTab = 1;
            RESTService.post('final-neighbour-general', {
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

        $scope.refreshOverallGraph = function(path) {
            $scope.pValueActual = $scope.pValueDisplayed;
            $scope.resetAllData();
            $scope.resetInputFields();
            /*$scope.getSelfLoops(GraphConfigService.tabNames.main, $scope.pValueActual,
                $scope);
            $scope.firstDropdownConfig = null;
            $scope.getDataForOverallGraph(path).then(function(config) {
                console.log(config.elements);
                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.applyConfig(config, "cyMain", $scope);
                $scope.firstNeighbourDropdownOptions = $scope.loadDropdownOptions($scope.cy);
                $rootScope.state = $rootScope.states.initial;
            });*/

            $scope.getGeneList();
        };

        $(document).ready(function() {
            $scope.refreshOverallGraph('overall-graph');
        });

        $scope.refreshGraphFilter = function() {
            $scope.refreshOverallGraph('overall-graph-weight-filter');
        };

        $scope.refreshGraphNoFilter = function() {
            $scope.refreshOverallGraph('overall-graph');
        };

        $scope.searchForGene = function(gene) {
            if (gene != null) {
                //$scope.findGeneInGraph($scope.cy, gene.value);

                if ($scope.genesOfInterest.indexOf(gene.value) < 0) {
                    $scope.genesOfInterest.push(gene.value);
                }
            }
        };

        $scope.getRelevantGenes = function(filter) {
            var filtered = filter && ($scope.negativeFilterEnabled || $scope.positiveFilterEnabled) ? 'yes' : 'no';
            RESTService.get("submatrix", {
                    params: {
                        pValue: $scope.pValueActual,
                        genes: $scope.genesOfInterest,
                        minNegativeWeight: $scope.minNegativeWeight ==
                            null || !$scope.negativeFilterEnabled ?
                            "NA" : $scope.minNegativeWeight,
                        minPositiveWeight: $scope.minPositiveWeight ==
                            null || !$scope.positiveFilterEnabled ?
                            "NA" : $scope.minPositiveWeight,
                        filter: filtered,
                        layout: $scope.selectedLayout
                    }
                })
                .then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    $scope.totalInteractions = data.totalInteractions;
                    if (filtered != 'yes') {
                        $scope.sliderMinWeightNegative = data.minNegativeWeight;
                        $scope.sliderMaxWeightPositive = data.maxPositiveWeight;
                    }
                    $scope.applyConfig(data.config, "cyMain", $scope);
                    $scope.firstNeighbourDropdownOptions = $scope.loadDropdownOptions($scope.cy, []);
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
    }
]);
