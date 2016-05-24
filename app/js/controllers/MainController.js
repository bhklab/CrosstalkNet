'use strict';

angular.module('myApp.MainController', ['ngRoute']).controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'ExportService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, ExportService, $q,
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

        $scope.correlationFilterModel = {
            min: -1,
            max: 1,
            negativeFilter: 0,
            positiveFilter: 0,
            negativeEnabled: false,
            positiveEnabled: false
        };

        $scope.correlationFilterFirst = angular.copy($scope.correlationFilterModel)

        $scope.correlationFilterSecond = angular.copy($scope.correlationFilterModel);

        $scope.negativeFilterEnabled = false;
        $scope.positiveFilterEnabled = false;

        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;
        $scope.getInteractingNodes = GraphConfigService.getInteractingNodes;
        $scope.applyConfig = GraphConfigService.applyConfig;

        $scope.flattenNeighbours = BasicDataService.flattenNeighbours;
        $scope.getNodesWithMinDegree = BasicDataService.getNodesWithMinDegree;
        $scope.getSelfLoops = BasicDataService.getSelfLoops;
        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        $scope.loadGeneListDropdownOptions = BasicDataService.loadGeneListDropdownOptions;
        $scope.querySearch = BasicDataService.querySearch;

        $scope.genesOfInterest = [];
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

        $scope.firstNeighbourInteractions = [];
        $scope.secondNeighbourInteractions = [];

        $scope.firstNeighbours = {
            epi: [],
            stroma: []
        };

        $scope.secondNeighbours = {
            epi: [],
            stroma: []
        };

        $scope.resize = GraphConfigService.resetZoom;

        $scope.edgeDictionary = {};

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Tables";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.inspectNeighbours = function(item, source) {
            if (item == null) {
                return;
            }

            GraphConfigService.firstSelectedGene = item;
            $rootScope.selectedTab = 1;
            RESTService.post('neighbour-general', {
                selectedGenes: [item],
                pValue: $scope.pValueActual,
                layout: $scope.selectedLayout
            }).then(function(data) {
                console.log(data);
                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.neighbours = angular.copy($scope.genesSecond);
                GraphConfigService.neighbourConfigs.firstDropdownConfig =
                    angular.copy(data.config);
                $rootScope.state = $rootScope.states.firstDropdown;
            });
        };

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.addGeneOfInterest = function(gene) {
            if (gene != null) {
                //$scope.findGeneInGraph($scope.cy, gene.value);

                if ($scope.genesOfInterest.indexOf(gene) < 0) {
                    $scope.genesOfInterest.push(gene);
                }
            }
        };

        $scope.locateGene = function() {};

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
            } else if ($scope.GOIState == $scope.GOIStates.filterSecond) {
                filterFirst = $scope.correlationFilterFirst.negativeEnabled || $scope.correlationFilterFirst.positiveEnabled;
                filterSecond = $scope.correlationFilterSecond.negativeEnabled || $scope.correlationFilterSecond.positiveEnabled;
                depth = 2;
            }

            RESTService.post("submatrix", {
                    pValue: $scope.pValueActual,
                    selectedGenes: $scope.genesOfInterest,
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
                    if (data.config == null) {
                        return;
                    }

                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    $scope.totalInteractions = data.totalInteractions;
                    $scope.firstNeighbourInteractions = data.firstNeighbourInteractions;
                    $scope.secondNeighbourInteractions = data.secondNeighbourInteractions;
                    $scope.applyConfig(data.config, "cyMain", $scope);
                    $scope.setNeighbours(1);
                    $scope.setNeighbours(2);
                    $scope.edgeDictionary = BasicDataService.createEdgeDictionary($scope.cy.edges());

                    if ($scope.GOIState == $scope.GOIStates.initial) {
                        $scope.correlationFilterFirst.min = data.minNegativeWeight;
                        $scope.correlationFilterFirst.max = data.maxPositiveWeight;
                        $scope.GOIState = $scope.GOIStates.filterFirst;
                    } else if ($scope.GOIState == $scope.GOIStates.filterFirst && depth == 2) {
                        $scope.correlationFilterSecond.min = data.minNegativeWeight;
                        $scope.correlationFilterSecond.max = data.maxPositiveWeight;
                        $scope.GOIState = $scope.GOIStates.getSecondNeighbours;
                    } else if ($scope.GOIState == $scope.GOIStates.getSecondNeighbours) {
                        $scope.GOIState = $scope.GOIStates.filterSecond;
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

        $scope.resetGeneSelection = function() {
            $scope.GOIState = $scope.GOIStates.initial;
            $scope.correlationFilterFirst = angular.copy($scope.correlationFilterModel);
            $scope.correlationFilterSecond = angular.copy($scope.correlationFilterModel);
        };

        $scope.setNeighbours = function(level) {
            if (level == 1) {
                $scope.firstNeighbours.epi = $scope.cy.filter(function(i, element) {
                    if (element.isNode() && (element.data('neighbourLevel') == level || element.data('neighbourLevel') == -1) && element.hasClass('epi')) {
                        return true;
                    }

                    return false;
                });

                $scope.firstNeighbours.stroma = $scope.cy.filter(function(i, element) {
                    if (element.isNode() && (element.data('neighbourLevel') == level || element.data('neighbourLevel') == -1) && element.hasClass('stroma')) {
                        return true;
                    }

                    return false;
                });

            } else if (level == 2) {
                $scope.secondNeighbours.epi = $scope.cy.filter(function(i, element) {
                    if (element.isNode() && element.data('neighbourLevel') >= 1 && element.hasClass('epi')) {
                        return true;
                    }

                    return false;
                });

                $scope.secondNeighbours.stroma = $scope.cy.filter(function(i, element) {
                    if (element.isNode() && element.data('neighbourLevel') >= 1 && element.hasClass('stroma')) {
                        return true;
                    }

                    return false;
                });
            }
        };

        $scope.getInteraction = function(source, target) {
            var edge = null;

            edge = $scope.cy.filter(function(i, element) {
                if (element.isEdge() && ((element.source().id() == source.id() && element.target().id() == target.id()) ||
                        (element.target().id() == source.id() && element.source().id() == target.id()))) {
                    return true;
                }

                return false
            });

            return edge.length == 0 ? 0 : edge.data('weight');
        };

        $scope.getInteractionViaDictionary = function(source, target) {
            if ($scope.edgeDictionary[source.id()][target.id()] != null) {
                return $scope.edgeDictionary[source.id()][target.id()];
            } else {
                return 0;
            }
        };

        $scope.exportTableToCSV = function(level) {
            $("#" + level + "-neighbours-table").tableToCSV();
        };

        $scope.getGeneList();
    }
]);
