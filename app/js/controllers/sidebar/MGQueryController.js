'use strict';

angular.module('myApp.controllers').controller('MGQueryController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'MainGraphControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', 'TableService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, MainGraphControls, InitializationService, ValidationService, SharedService, QueryService, TableService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initialize = function(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            intializeVariables();
        };

        vm.sharedData = SharedService.data.global;

        function intializeVariables() {
            vm.selectedItemFirst = null;
            vm.selectedGOI = null;
            vm.zoomGene = null;
            vm.searchTextGOI = "";
            vm.searchTextFirst = "";
            vm.searchTextSecond = "";
            vm.searchTextZoom = "";

            vm.minDegree = {
                first: 0,
                second: 0
            };

            vm.correlationFilterModel = {
                min: -1,
                max: 1,
                negativeFilter: 0,
                positiveFilter: 0,
                negativeEnabled: false,
                positiveEnabled: false
            };

            vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);

            vm.displayModes = angular.copy(GlobalControls.displayModes);

            vm.genesOfInterest = [];

            vm.GOIStates = {
                initial: 0,
                filterFirst: 1,
                getSecondNeighbours: 2,
                filterSecond: 3
            };

            vm.GOIState = vm.GOIStates.initial;
            vm.allVisibleGenes = [];

            vm.query = {
                limit: 5,
                page: 1
            };

            vm.sdWithinTab.showGraphSummary = false;
        }

        MainGraphControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        vm.refreshGraph = function(filter) {
            vm.clearLocatedGene();
            SharedService.resetWTM(vm);
            QueryService.getRelevantGenes(vm, filter).then(function(result) {
                if (result.data == null) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                vm.totalInteractions = result.data.totalInteractions;
                if (vm.sdWithinTab.display == GlobalControls.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, result.data.config, "cyMain");

                vm.sdWithinTab.edgeDictionary = result.data.edgeDictionary;
                vm.sdWithinTab.selfLoops = result.data.selfLoops;
                vm.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm);
                vm.sdWithinTab.showGraphSummary = true;
                $rootScope.state = $rootScope.states.showingGraph;

                vm.advanceGOIState(result.data, result.depth);
                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, result.depth, false);
            });
        };

        $scope.$watch(function() {
            if (vm.sdWithinTab && (vm.genesOfInterest != null && vm.genesOfInterest.length > 0) ||
                (vm.sdWithinTab != null && vm.sdWithinTab.selectedLayout != null && vm.GOIState != vm.GOIStates.initial)) {
                return vm.sdWithinTab.selectedLayout;
            }
            return null;
        }, function(newValue, oldValue) {
            if (newValue != null && oldValue != null && newValue != oldValue) {
                vm.refreshGraph(true);    
            }
        });

        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                intializeVariables();
                GraphConfigService.destroyGraph(vm);
                SharedService.resetWTM(vm);
            }
        });

        $scope.$watch(function() {
            if (vm.sdWithinTab) {
                return vm.sdWithinTab.display;
            }
            return null;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph && newValue != oldValue) {
                $timeout(function() {
                    if (vm.sdWithinTab.config != null && vm.sdWithinTab.cy != null) {
                        GraphConfigService.destroyGraph(vm);
                        vm.needsRedraw = false;
                        vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyMain");
                    }
                }, 250);
            }
        });
    }
]);
