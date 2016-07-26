'use strict';
/**
 * Controller for the QUERY sub-tab MAIN GRAPH tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('MGQueryController', [
        '$scope',
        '$rootScope',
        'GraphConfigService', 'GlobalControls', 'MainGraphControls', 'GlobalSharedData', 'QueryService', 'TableService', '$timeout',
        'MGSharedData',
        MGQueryController
    ]);

    /**
     * @namespace MGQueryController
     * @desc Controller for the QUERY sub-tab in the MAIN GRAPH tab.
     * @memberOf controllers
     */
    function MGQueryController($scope, $rootScope, GraphConfigService, GlobalControls, MainGraphControls, GlobalSharedData, QueryService, TableService,
        $timeout, MGSharedData) {
        var vm = this;
        vm.scope = $scope;

        vm.sharedData = GlobalSharedData.data;

        vm.initializeController = initializeController;
        vm.refreshGraph = refreshGraph;

        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        MainGraphControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.MGQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = MGSharedData.data;
            intializeVariables();
        }

        /**
         * @summary Initializes variables used within the tab for binding to the controls.
         *
         * @memberOf controllers.MGQueryController
         */
        function intializeVariables() {
            vm.selectedItemFirst = null;
            vm.selectedGOI = null;
            vm.zoomGene = null;
            vm.searchTextGOI = "";
            vm.searchTextFirst = "";
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

        /**
         * @summary Resets the data shown within the MAIN GRAPH tab and
         * obtains a cytoscape.js config for the current user query.
         *
         * @memberOf controllers.MGQueryController
         */
        function refreshGraph(filter) {
            vm.clearLocatedGene();
            MGSharedData.resetWTM(vm);
            getConfigForGraph(filter);
        }

        /**
         * @summary Obtains a cytoscpape.js config from the server for the current
         * user query.
         *
         * @memberOf controllers.MGQueryController
         */
        function getConfigForGraph(filter) {
            QueryService.getMainGraph(vm, filter).then(function(result) {
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
                vm.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm.sdWithinTab.cy);
                vm.sdWithinTab.showGraphSummary = true;
                $rootScope.state = $rootScope.states.showingGraph;

                vm.setFilterMinMax(result.depth, result.data.minNegativeWeight, result.data.maxPositiveWeight);
                vm.advanceGOIState(result.depth);
                
                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, result.depth, false);
            });
        }

        /**
         * @summary Watches the clearAllData variable and clears the data within the tab when 
         * it changes to true.
         *
         * @memberOf controllers.MGQueryController
         */
        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                intializeVariables();
                GraphConfigService.destroyGraph(vm);
                MGSharedData.resetWTM(vm);
            }
        });

        /** 
         * @summary Watches the selectedLayout variable and refreshes the graph when the 
         * layout changes.
         *
         * @memberOf controllers.MGQueryController
         */
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

        /** 
         * @summary Watches the display variable and redraws the graph when switching
         * from the Tables view to the Graph view.
         *
         * @memberOf controllers.MGQueryController
         */ 
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
})();
