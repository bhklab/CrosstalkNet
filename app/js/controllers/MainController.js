'use strict';

angular.module('myApp.controllers').controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'ControlsService', 'ExportService', 'FileUploadService', 'InitializationService', 'ValidationService', 'SharedService', 'TableService', 'QueryService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, GraphConfigService, ControlsService, ExportService, FileUploadService, InitializationService, ValidationService, SharedService, TableService, QueryService,
        $q, $timeout, $cookies, $mdDialog) {
        $rootScope.selectedTab = 0;
        $rootScope.geneLists = { nonDelta: null, delta: null };
        $rootScope.states = angular.copy(ControlsService.states);
        $rootScope.state = $rootScope.states.initial;

        var vm = this;
        vm.scope = $scope;

        $scope.init = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.display = vm.displayModes.graph;
        };

        vm.displayModes = angular.copy(ControlsService.displayModes);
        vm.switchModel = false;
        vm.sharedData = SharedService.data.nonDelta;
        vm.changeDisplay = ControlsService.changeDisplay;

        /*
        var vm = this;
        vm.scope = $scope;
        vm.ctrl = "main";
        vm.graphType = "nonDelta";

        InitializationService.initializeCommonVariables(vm);
        vm.getAllVisibleGenes = ControlsService.getAllVisibleGenes;
        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        vm.uploadFiles = FileUploadService.uploadFiles;
        vm.config = null;
        vm.needsRedraw = false;
        vm.tabIndex = 0;

        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;

        vm.sharedData = SharedService.data.nonDelta;
        
        vm.clearLocatedGene = SharedService.methods.main.clearLocatedGene;
        vm.getGeneList = QueryService.getGeneList;
        vm.getFileList = QueryService.getFileList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;

        vm.closeEdgeInspector = ControlsService.closeEdgeInspector;
        vm.addGeneOfInterest = ControlsService.addGeneOfInterest;
        vm.changeDisplay = ControlsService.changeDisplay;
        vm.removeGene = ControlsService.removeGene;
        vm.removeGenesOfInterest = ControlsService.removeGenesOfInterest;
        vm.resetFilters = ControlsService.resetFilters;
        vm.resetGeneSelection = ControlsService.resetGeneSelection;
        vm.resetInputFieldsGlobal = ControlsService.resetInputFieldsGlobal;
        vm.resetInputFieldsLocal = ControlsService.resetInputFieldsLocal;
        vm.getNodesWithMinDegree = ControlsService.getNodesWithMinDegree;
        vm.querySearch = ControlsService.querySearch;

        vm.getInteractionViaDictionary = TableService.getInteractionViaDictionary;
        vm.setNeighboursGeneral = TableService.setNeighboursGeneral;

        vm.getRelevantGenes = function(filter) {
            var filterFirst = false;
            var filterSecond = false;
            var depth = 1;
            $rootScope.state = $rootScope.states.loadingGraph;
            vm.showGraphSummary = false;

            if (vm.GOIState == vm.GOIStates.filterFirst) {
                if (filter == false) {
                    depth = 2;
                }
                filter = true;
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
            } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
                filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
                depth = 2;
            } else if (vm.GOIState == vm.GOIStates.filterSecond) {
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
                filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
                depth = 2;
            }

            RESTService.post("submatrix", {
                    selectedGenes: vm.genesOfInterest,
                    minNegativeWeightFirst: vm.correlationFilterFirst.negativeFilter ==
                        null || !vm.correlationFilterFirst.negativeEnabled ?
                        "NA" : vm.correlationFilterFirst.negativeFilter,
                    minPositiveWeightFirst: vm.correlationFilterFirst.positiveFilter ==
                        null || !vm.correlationFilterFirst.positiveEnabled ?
                        "NA" : vm.correlationFilterFirst.positiveFilter,
                    minNegativeWeightSecond: vm.correlationFilterSecond.negativeFilter ==
                        null || !vm.correlationFilterSecond.negativeEnabled ?
                        "NA" : vm.correlationFilterSecond.negativeFilter,
                    minPositiveWeightSecond: vm.correlationFilterSecond.positiveFilter ==
                        null || !vm.correlationFilterSecond.positiveEnabled ?
                        "NA" : vm.correlationFilterSecond.positiveFilter,
                    selectedFilterFirst: { negative: vm.correlationFilterFirst.negativeEnabled, positive: vm.correlationFilterFirst.positiveEnabled },
                    selectedFilterSecond: { negative: vm.correlationFilterSecond.negativeEnabled, positive: vm.correlationFilterSecond.positiveEnabled },
                    filterFirst: filterFirst && filter,
                    filterSecond: filterSecond && filter,
                    layout: vm.selectedLayout,
                    depth: depth,
                    fileName: vm.sharedData.correlationFileActual
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    $rootScope.state = $rootScope.states.loadingConfig;
                    vm.totalInteractions = data.totalInteractions;
                    if (vm.display == vm.displayModes.table) {
                        vm.needsRedraw = true;
                    }
                    vm.applyConfig(vm, data.config, "cyMain" + vm.graphType);

                    vm.edgeDictionary = data.edgeDictionary;
                    vm.selfLoops = data.selfLoops;
                    vm.allVisibleGenes = vm.getAllVisibleGenes(vm);
                    vm.showGraphSummary = true;
                    $rootScope.state = $rootScope.states.showingGraph;

                    if (vm.GOIState == vm.GOIStates.initial) {
                        vm.correlationFilterFirst.min = data.minNegativeWeight;
                        vm.correlationFilterFirst.max = data.maxPositiveWeight;
                        vm.GOIState = vm.GOIStates.filterFirst;
                    } else if (vm.GOIState == vm.GOIStates.filterFirst && depth == 2) {
                        vm.correlationFilterSecond.min = data.minNegativeWeight;
                        vm.correlationFilterSecond.max = data.maxPositiveWeight;
                        vm.GOIState = vm.GOIStates.getSecondNeighbours;
                    } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
                        vm.GOIState = vm.GOIStates.filterSecond;
                    }

                    vm.setNeighboursGeneral(vm, depth, false);
                });
        };

        vm.refreshGeneList = function() {
            vm.GOIState = vm.GOIStates.initial;
            vm.closeEdgeInspector(this);
            vm.removeGenesOfInterest(vm);
            vm.resetInputFieldsGlobal(vm);
            vm.resetFilters(vm);
            vm.sharedData.correlationFileActual = vm.correlationFileDisplayed;
            vm.overallMatrixStats = null;
            vm.allVisibleGenes = [];
            vm.tabIndex = 1;
            vm.showGraphSummary = false;

            GraphConfigService.destroyGraph(vm);

            vm.getGeneList(vm);
            vm.getOverallMatrixStats(vm);
        };

        vm.returnToFirstNeighboursFilter = function() {
            vm.GOIState = vm.GOIStates.filterFirst;
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };

        $scope.$watch(function() {
            return vm.display;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph) {
                $timeout(function() {
                    if (vm.config != null) {
                        vm.cy.resize();
                        vm.needsRedraw = false;
                        vm.applyConfig(vm, vm.config, "cyMain" + vm.graphType);
                    }
                }, 250);

            }
        });

        /*
        $scope.$watch(function() {
            return vm.sharedData.reloadFileList;
        }, function(newValue, oldValue) {
            if (newValue == true && oldValue == false) {
                vm.getFileList(vm, ['tumor', 'normal']);
                vm.sharedData.reloadFileList = false;
            }
        });*/
    }
]);
