'use strict';

angular.module('myApp.MainController', ['ngRoute']).controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'ExportService', 'FileUploadService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, ExportService, FileUploadService, $q,
        $timeout) {
        $rootScope.selectedTab = 0;
        $scope.selectedItemFirst = null;
        $scope.selectedGOI = null;
        $scope.zoomGene = null;
        $scope.searchTextGOI = "";
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.searchTextZoom = "";
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

        $scope.getNodesWithMinDegree = BasicDataService.getNodesWithMinDegree;
        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        $scope.loadGeneListDropdownOptions = BasicDataService.loadGeneListDropdownOptions;
        $scope.querySearch = BasicDataService.querySearch;
        $scope.setNeighbours = BasicDataService.setNeighbours;

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
        $scope.selfLoops = [];
        $scope.allVisibleGenes = [];

        $rootScope.correlationFileDisplayed = null;
        $rootScope.correlationFileActual = null;

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
                layout: $scope.selectedLayout,
                file: $rootScope.correlationFileActual
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
                if ($scope.genesOfInterest.indexOf(gene) < 0) {
                    $scope.genesOfInterest.push(gene);
                }
            }
        };

        $scope.locateGene = function(gene) {
            if (gene != null && gene != '') {
                $scope.findGeneInGraph($scope, gene);
            }
        };

        $scope.clearLocatedGene = function() {
            GraphConfigService.clearLocatedGene($scope);
        }

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
                    depth: depth,
                    file: $rootScope.correlationFileActual
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
                    $scope.setNeighbours($scope, 1);
                    $scope.setNeighbours($scope, 2);
                    $scope.edgeDictionary = data.edgeDictionary;
                    $scope.selfLoops = data.selfLoops;
                    $scope.allVisibleGenes = $scope.getAllVisibleGenes();

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
            RESTService.post('gene-list', {file: $rootScope.correlationFileActual })
                .then(function(data) {
                    $scope.geneList = data.geneList;
                });
        };

        $scope.getFileList = function() {
            RESTService.get('available-matrices')
                .then(function(data) {
                    $scope.fileList = data.fileList;
                    //$scope.getGeneList()
                });
        };

        $scope.resetGeneSelection = function() {
            $scope.GOIState = $scope.GOIStates.initial;
            $scope.correlationFilterFirst = angular.copy($scope.correlationFilterModel);
            $scope.correlationFilterSecond = angular.copy($scope.correlationFilterModel);
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
            if ($scope.edgeDictionary[source] != null && $scope.edgeDictionary[source][target] != null) {
                return $scope.edgeDictionary[source][target];
            } else {
                return 0;
            }
        };

        $scope.exportTableToCSV = function(level) {
            $("#" + level + "-neighbours-table").tableToCSV();
        };

        $scope.refreshGeneList = function() {
            $rootScope.correlationFileActual = JSON.parse($rootScope.correlationFileDisplayed);
            $scope.getGeneList();
        };

        $scope.getAllVisibleGenes = function() {
            var result = [];
            var nodes = $scope.cy.$('node').not(':parent');

            for (var i = 0; i < nodes.length; i++) {
                result.push(nodes[i].id());
            }

            return result;
        };

        $scope.closeEdgeInspector = GraphConfigService.closeEdgeInspector;
        $scope.uploadFiles = FileUploadService.uploadFiles;

        //$scope.getGeneList();
        $scope.getFileList();
    }
]);
