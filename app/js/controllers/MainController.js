'use strict';

angular.module('myApp.controllers').controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'ExportService', 'FileUploadService', 'InitializationService', 'ValidationService', 'SharedService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, ExportService, FileUploadService, InitializationService, ValidationService, SharedService,
        $q, $timeout, $cookies, $mdDialog) {
        $rootScope.selectedTab = 0;
        $rootScope.geneLists = { nonDelta: null, delta: null };
        $rootScope.states = angular.copy(BasicDataService.states);
        $rootScope.state = $rootScope.states.initial;

        var vm = this;
        vm.scope = $scope;
        vm.ctrl = "main";
        vm.graphType = "nonDelta";

        InitializationService.initializeCommonVariables(vm);
        vm.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        vm.uploadFiles = FileUploadService.uploadFiles;
        vm.config = null;
        vm.needsRedraw = false;
        vm.tabIndex = 0;

        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;

        vm.sharedData = SharedService.data.nonDelta;
        vm.showGraphSummary = false;

        vm.changeDisplay = SharedService.methods.changeDisplay;
        vm.addGeneOfInterest = SharedService.methods.addGeneOfInterest;
        vm.locateGene = SharedService.methods.locateGene;
        vm.closeEdgeInspector = SharedService.methods.closeEdgeInspector;
        vm.clearLocatedGene = SharedService.methods.clearLocatedGene;

        vm.removeGenesOfInterest = function() {
            vm.genesOfInterest = [];
            vm.closeEdgeInspector(this);
            vm.resetInputFieldsLocal('');
            vm.resetFilters();
            if (vm.cy) {
                vm.cy.destroy();
            }
            vm.cy = null;
            vm.showGraphSummary = false;
        };

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

                    console.log(data);
                    $rootScope.state = $rootScope.states.loadingConfig;
                    vm.totalInteractions = data.totalInteractions;
                    vm.firstNeighbourInteractions = data.firstNeighbourInteractions;
                    vm.secondNeighbourInteractions = data.secondNeighbourInteractions;
                    if (vm.display == vm.displayModes.table) {
                        vm.needsRedraw = true;
                    }
                    vm.applyConfig(data.config, "cyMain" + vm.graphType, vm);

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

        vm.removeGene = function(gene) {
            if (vm.genesOfInterest.length == 1) {
                vm.removeGenesOfInterest();
            } else {
                vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
            }
        };

        vm.getGeneList = function() {
            $rootScope.state = $rootScope.states.gettingGeneList;
            RESTService.post('gene-list', { fileName: vm.sharedData.correlationFileActual })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    vm.sharedData.geneList = data.geneList;
                    $rootScope.state = $rootScope.states.initial;
                });
        };

        vm.getFileList = function() {
            RESTService.post('available-matrices', { types: ['normal', 'tumor'] })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }

                    vm.fileList = data.fileList;
                });
        };

        vm.getOverallMatrixStats = function() {
            RESTService.post('overall-matrix-stats', { fileName: vm.sharedData.correlationFileActual }).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                vm.overallMatrixStats = data.overallMatrixStats;
                console.log(data);
            });
        };

        vm.resetGeneSelection = function() {
            vm.GOIState = vm.GOIStates.initial;
            vm.resetFilters();
        };

        vm.resetFilters = function() {
            vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };

        vm.getInteraction = function(source, target) {
            var edge = null;

            edge = vm.cy.filter(function(i, element) {
                if (element.isEdge() && ((element.source().id() == source.id() && element.target().id() == target.id()) ||
                        (element.target().id() == source.id() && element.source().id() == target.id()))) {
                    return true;
                }

                return false
            });

            return edge.length == 0 ? 0 : edge.data('weight');
        };

        vm.getInteractionViaDictionary = function(source, target) {
            if (vm.edgeDictionary[source] != null && vm.edgeDictionary[source][target] != null) {
                return vm.edgeDictionary[source][target];
            } else {
                return 0;
            }
        };

        vm.refreshGeneList = function() {
            vm.GOIState = vm.GOIStates.initial;
            vm.closeEdgeInspector(this);
            vm.removeGenesOfInterest();
            vm.resetInputFieldsGlobal();
            vm.resetFilters();
            vm.sharedData.correlationFileActual = vm.correlationFileDisplayed;
            vm.overallMatrixStats = null;
            vm.allVisibleGenes = [];
            vm.tabIndex = 1;
            vm.showGraphSummary = false;

            if (vm.cy) {
                vm.cy.destroy();
            }
            vm.cy = null;

            vm.getGeneList();
            vm.getOverallMatrixStats();
        };

        vm.returnToFirstNeighboursFilter = function() {
            vm.GOIState = vm.GOIStates.filterFirst;
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };

        $scope.$watch(function() {
            return vm.mdDialog;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph) {
                $timeout(function() {
                    if (vm.config != null) {
                        vm.cy.resize();
                        vm.needsRedraw = false;
                        vm.applyConfig(vm.config, "cyMain" + vm.graphType, vm);
                    }
                }, 250);

            }
        });

        $scope.$watch(function() {
            return vm.sharedData.reloadFileList; }, function(newValue, oldValue) {
            if (newValue == true && oldValue == false) {
                vm.getFileList();
                vm.sharedData.reloadFileList = false;
            }
        });
    }
]);
