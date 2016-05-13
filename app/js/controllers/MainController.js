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
        $scope.ctrl = "neighbour";

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

        $scope.sliderMinWeightNegative = 0;
        $scope.sliderMaxWeightPositive = 0;

        $scope.negativeFilterEnabled = false;
        $scope.positiveFilterEnabled = false;

        $scope.data = GraphConfigService.tabs.main.data;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;
        $scope.getSelfLoops = GraphConfigService.getSelfLoops;
        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        $scope.querySearch = BasicDataService.querySearch;
        $scope.genesOfInterest = [];

        $scope.applyConfig = function(config, containerID) {
            $scope.elemCopy = angular.copy(config.elements);
            $scope.styleCopy = angular.copy(config.style);
            config.container = document.getElementById(containerID);
            $scope.cy = cytoscape(config);

            $scope.nodes = $scope.cy.nodes().length;
            $scope.edges = $scope.cy.edges().length;

            $scope.cy.fit($scope.cy.$("*"), 10);
        }

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

            if (source == 'first') {
                $rootScope.selectedTab = 1;
                $scope.firstSelectedGene = item.value.substring(0, item.value
                    .length - 2).toUpperCase();
                GraphConfigService.firstSelectedGene = $scope.firstSelectedGene;
                $scope.genesSecond = [];
                $rootScope.state = $rootScope.states.loadingFirst;
                RESTService.post('new-neighbour-general', {
                    gene: item.value.substring(0, item.value
                        .length - 2).toUpperCase(),
                    side: item.value.substring(item.value.length -
                        2),
                    degree: item.object.degree,
                    pValue: $scope.pValueActual,
                    neighbour: 1,
                    layout: $scope.selectedLayout,
                    first: $scope.firstSelectedGene,
                    second: "null"
                }).then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    //$scope.applyConfig(data.config, "cyMain");
                    $scope.genesSecond = $scope.loadDropdownOptions($scope.cy,
                        item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    GraphConfigService.neighbourConfigs.firstDropdownConfig =
                        angular.copy(data.config);
                    $rootScope.state = $rootScope.states.firstDropdown;
                });
            } else {
                $rootScope.selectedTab = 1;
                var originalElements = $scope.firstDropdownConfig.elements;
                $rootScope.state = $rootScope.states.loadingSecond;
                RESTService.post('new-neighbour-general', {
                    gene: item.value.substring(0, item.value
                        .length - 2).toUpperCase(),
                    side: item.value.substring(item.value.length -
                        2),
                    pValue: $scope.pValueActual,
                    layout: $scope.selectedLayout,
                    first: $scope.firstSelectedGene,
                    second: item.value.substring(0, item.value
                        .length - 2).toUpperCase()
                }).then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    //$scope.applyConfig(data.config, "cyMain");
                    //$scope.genesSecond = $scope.loadDropdownOptions(item.value);
                    $scope.neighbours = angular.copy($scope.genesSecond);
                    GraphConfigService.neighbourConfigs.secondDropdownConfig =
                        angular.copy(data.config);
                    $rootScope.state = $rootScope.states.secondDropdown;
                });
            }
        };

        $scope.resize = GraphConfigService.resetZoom;

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });

            //$mdAutocompleteCtrl.clear();
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
            $scope.getSelfLoops(GraphConfigService.tabNames.main, $scope.pValueActual,
                $scope);
            $scope.firstDropdownConfig = null;
            $scope.getDataForOverallGraph(path).then(function(config) {
                console.log(config.elements);
                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.applyConfig(config, "cyMain");
                $scope.genesFirst = $scope.loadDropdownOptions($scope.cy);
                $rootScope.state = $rootScope.states.initial;
            });
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
                $scope.findGeneInGraph($scope.cy, gene.value);

                if ($scope.genesOfInterest.indexOf(gene) < 0) {
                    $scope.genesOfInterest.push(gene.value);
                }
            }
        };

        $scope.getRelevantGenes = function() {
            RESTService.get("submatrix", {
                    params: {
                        pValue: $scope.pValueActual,
                        genes: $scope.genesOfInterest
                    }
                })
                .then(function(data) {
                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    $scope.totalInteractions = data.totalInteractions;
                    $scope.sliderMinWeightNegative = data.minNegativeWeight;
                    $scope.sliderMaxWeightPositive = data.maxPositiveWeight;
                    $scope.applyConfig(data.config, "cyMain");
                });
        };

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
        };
    }
]);
