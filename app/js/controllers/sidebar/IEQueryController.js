'use strict';

angular.module('myApp.controllers').controller('IEQueryController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'InteractionExplorerControls', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'TableService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, InteractionExplorerControls, GlobalControls, InitializationService, ValidationService, SharedService, TableService,
        QueryService, $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initialize = function(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            initializeVariables();
        };

        vm.sharedData = SharedService.data.global;

        InteractionExplorerControls.setMethods(vm);

        GlobalControls.setMethodsSideBar(vm);

        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        function initializeVariables() {
            vm.zoomGene = null;
            vm.searchTextGOI = "";
            vm.searchTextFirst = "";
            vm.searchTextZoom = "";

            vm.displayModes = angular.copy(GlobalControls.displayModes);

            vm.genesOfInterest = [];
            vm.explorerGenes = [];
            vm.allVisibleGenes = [];

            vm.query = {
                limit: 5,
                page: 1
            };

            vm.sdWithinTab.showGraphSummary = false;
        }

        vm.allowAdditionalGenes = true;

        vm.refreshGraph = function() {
            vm.resetDisplayedData();
            SharedService.resetWTM(vm);
            QueryService.getInteractionExplorerConfig(vm).then(function(result) {
                if (result.data == null) {
                    return;
                }
                
                $rootScope.state = $rootScope.states.loadingConfig;
                if (vm.display == vm.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, result.data.config, "cyInteractionExplorer");
                vm.sdWithinTab.selfLoops = result.data.selfLoops;
                vm.sdWithinTab.edgeDictionary = result.data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                vm.explorerGenes = vm.loadExplorerDropdownOptions(vm.genesOfInterest);
                vm.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm);
                $rootScope.state = $rootScope.states.showingGraph;

                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, result.level, true);
                vm.allowAdditionalGenes = true;

                vm.sdWithinTab.showGraphSummary = true;
            });
        };

        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                vm.genesOfInterest = [];
                GraphConfigService.destroyGraph(vm);
                vm.resetDisplayedData();
            }
        });

        $scope.$watch(function() {
            if (vm.sdWithinTab && (vm.genesOfInterest != null && vm.genesOfInterest.length > 0)) {
                return vm.sdWithinTab.selectedLayout;
            }
            return null;
        }, function(newValue, oldValue) {
            if (newValue != null && oldValue != null && newValue != oldValue) {
                vm.refreshGraph();
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
                        vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyInteractionExplorer");
                    }
                }, 250);
            }
        });
    }
]);
