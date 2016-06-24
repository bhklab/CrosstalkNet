'use strict';

angular.module('myApp.controllers').controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'ExportService', 'FileUploadService', 'InitializationService', 'ValidationService', 'SharedService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, ExportService, FileUploadService, InitializationService, ValidationService, SharedService,
        $q, $timeout, $cookies, $mdDialog) {
        $rootScope.selectedTab = 0;
        $rootScope.correlationFilesDisplayed = { nonDelta: null, delta: null };
        $rootScope.correlationFilesActual = { nonDelta: null, delta: null };
        $rootScope.geneLists = { nonDelta: null, delta: null };
        $rootScope.states = angular.copy(BasicDataService.states);
        $rootScope.state = $rootScope.states.initial;

        $scope.ctrl = "main";
        InitializationService.initializeCommonVariables($scope);
        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.uploadFiles = FileUploadService.uploadFiles;
        $scope.config = null;
        $scope.needsRedraw = false;
        $scope.tabIndex = 0;

        $scope.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        $scope.exportGraphToPNG = ExportService.exportGraphToPNG;

        $scope.sharedData = SharedService.data;
        $scope.showGraphSummary = false;

        $scope.init = function(whichController) {
            $scope.whichController = whichController;
        };

        $scope.changeDisplay = function() {
            if ($scope.display == $scope.displayModes.graph) {
                $scope.display = $scope.displayModes.table;
            } else {
                $scope.display = $scope.displayModes.graph;
            }
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

        $scope.closeEdgeInspector = function() {
            $scope.selectedEdge = {};
        };

        $scope.clearLocatedGene = function() {
            $scope.resetInputFieldsLocal('geneLocator');
            GraphConfigService.clearLocatedGene($scope);
        };

        $scope.removeGenesOfInterest = function() {
            $scope.genesOfInterest = [];
            $scope.closeEdgeInspector();
            $scope.resetInputFieldsLocal('');
            $scope.resetFilters();
            if ($scope.cy) {
                $scope.cy.destroy();
            }
            $scope.cy = null;
            $scope.showGraphSummary = false;
        };

        $scope.getRelevantGenes = function(filter) {
            var filterFirst = false;
            var filterSecond = false;
            var depth = 1;
            $rootScope.state = $rootScope.states.loadingGraph;
            $scope.showGraphSummary = false;

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
                    selectedFilterFirst: { negative: $scope.correlationFilterFirst.negativeEnabled, positive: $scope.correlationFilterFirst.positiveEnabled },
                    selectedFilterSecond: { negative: $scope.correlationFilterSecond.negativeEnabled, positive: $scope.correlationFilterSecond.positiveEnabled },
                    filterFirst: filterFirst && filter,
                    filterSecond: filterSecond && filter,
                    layout: $scope.selectedLayout,
                    depth: depth,
                    fileName: $rootScope.correlationFilesActual[$scope.whichController]
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    $scope.totalInteractions = data.totalInteractions;
                    $scope.firstNeighbourInteractions = data.firstNeighbourInteractions;
                    $scope.secondNeighbourInteractions = data.secondNeighbourInteractions;
                    if ($scope.display == $scope.displayModes.table) {
                        $scope.needsRedraw = true;
                    }
                    $scope.applyConfig(data.config, "cyMain" + $scope.whichController, $scope);

                    $scope.edgeDictionary = data.edgeDictionary;
                    $scope.selfLoops = data.selfLoops;
                    $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                    $scope.showGraphSummary = true;
                    $rootScope.state = $rootScope.states.showingGraph;

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

                    $scope.setNeighboursGeneral($scope, depth, false);
                });
        };

        $scope.removeGene = function(gene) {
            if ($scope.genesOfInterest.length == 1) {
                $scope.removeGenesOfInterest();
            } else {
                $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
            }
        };

        $scope.getGeneList = function() {
            $rootScope.state = $rootScope.states.gettingGeneList;
            RESTService.post('gene-list', { fileName: $rootScope.correlationFilesActual[$scope.whichController] })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    $rootScope.geneLists[$scope.whichController] = data.geneList;
                    $rootScope.state = $rootScope.states.initial;
                });
        };

        $scope.getFileList = function() {
            var types = $scope.whichController == 'nonDelta' ? ['normal', 'tumor'] : ['delta'];
            RESTService.post('available-matrices', { types: types })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    $scope.fileList = data.fileList;
                });
        };

        $scope.getOverallMatrixStats = function() {
            RESTService.post('overall-matrix-stats', { fileName: $rootScope.correlationFilesActual[$scope.whichController] }).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                $scope.overallMatrixStats = data.overallMatrixStats;
                console.log(data);
            });
        };

        $scope.resetGeneSelection = function() {
            $scope.GOIState = $scope.GOIStates.initial;
            $scope.resetFilters();
        };

        $scope.resetFilters = function() {
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

        $scope.refreshGeneList = function() {
            $scope.closeEdgeInspector();
            $scope.removeGenesOfInterest();
            $scope.resetInputFieldsGlobal();
            $scope.resetFilters();
            $rootScope.correlationFilesActual[$scope.whichController] = $rootScope.correlationFilesDisplayed[$scope.whichController];
            $scope.overallMatrixStats = null;
            $scope.GOIState = $scope.GOIStates.initial;
            $scope.allVisibleGenes = [];
            $scope.tabIndex = 1;
            $scope.showGraphSummary = false;

            if ($scope.cy) {
                $scope.cy.destroy();
            }
            $scope.cy = null;

            $scope.getGeneList();
            $scope.getOverallMatrixStats();
        };

        $scope.returnToFirstNeighboursFilter = function() {
            $scope.GOIState = $scope.GOIStates.filterFirst;
            $scope.correlationFilterSecond = angular.copy($scope.correlationFilterModel);
        };

        $scope.$watch('display', function(newValue, oldValue) {
            if (newValue == 'Graph') {
                $timeout(function() {
                    if ($scope.config != null) {
                        $scope.cy.resize();
                        $scope.needsRedraw = false;
                        $scope.applyConfig($scope.config, "cyMain" + $scope.whichController, $scope);
                    }
                }, 250);

            }
        });

        $scope.$watch('sharedData[whichController].reloadFileList', function(newValue, oldValue) {
            if (newValue == true && oldValue == false) {
                $scope.getFileList();
                $scope.sharedData[$scope.whichController].reloadFileList = false;
            }
        });
    }
]);
