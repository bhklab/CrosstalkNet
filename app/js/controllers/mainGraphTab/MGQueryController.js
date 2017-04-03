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
     *
     * @desc Controller for the QUERY sub-tab in the MAIN GRAPH tab.
     *
     * @memberOf controllers
     */
    function MGQueryController($scope, $rootScope, GraphConfigService, GlobalControls, MainGraphControls, GlobalSharedData, QueryService, TableService,
        $timeout, MGSharedData) {
        var vm = this;
        vm.scope = $scope;

        vm.sharedData = GlobalSharedData.data;

        vm.initializeController = initializeController;
        vm.refreshGraph = refreshGraph;
        vm.removeGene = removeGene;
        vm.removeAllGenes = removeAllGenes;
        vm.backToFirstNeighbours = backToFirstNeighbours;

        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        MainGraphControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.MGQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = MGSharedData.data;
            vm.initializeVariables();
        }

        /**
         * @summary Removes a gene object from the array of genes of interest. 
         * Clears the displayed data in the case of genesOfInterest becoming empty,
         * refreshes the graph otherwise.
         *
         * @param {Object} gene The gene to remove.
         *
         * @memberOf controllers.MGQueryController
         */
        function removeGene(gene) {
            if (vm.genesOfInterest.length == 1) {
                vm.removeAllGenes();
            } else {
                vm.GOIState = vm.GOIStates.initial;
                vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
                vm.refreshGraph();
            }
        }

        /**
         * @summary Removes all genes of interest and resets all data within the
         * tab.
         *
         * @memberOf controllers.MGQueryController
         */
        function removeAllGenes() {
            resetAllData();
        }

        /**
         * @summary Resets all data within the tab to the initial state
         * as if no queries have been made.
         *
         * @memberOf controllers.MGQueryController
         */
        function resetAllData() {
            vm.initializeVariables();
            GraphConfigService.destroyGraph(MGSharedData);
            MGSharedData.resetWTM();
        }

        /**
         * @summary Resets the data shown within the MAIN GRAPH tab and
         * obtains a cytoscape.js config for the current user query.
         *
         * @memberOf controllers.MGQueryController
         */
        function refreshGraph(filter) {
            vm.clearLocatedGene();
            GraphConfigService.destroyGraph(MGSharedData);
            MGSharedData.resetWTM();
            getConfigForGraph(filter);
        }

        /**
         * @summary Obtains a cytoscpape.js config from the server for the current
         * user query.
         *
         * @memberOf controllers.MGQueryController
         */
        function getConfigForGraph(filter) {
            if (!vm.validateFilterInput()) {
                return;
            }

            QueryService.getMainGraph(vm, filter).then(function(result) {
                if (result.data == null) {
                    $rootScope.state = $rootScope.states.initial;
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
                vm.sdWithinTab.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm.sdWithinTab.cy);
                vm.sdWithinTab.showGraphSummary = true;
                $rootScope.state = $rootScope.states.showingGraph;

                vm.setFilterMinMax(result.depth, result.data.minNegativeWeight, result.data.maxPositiveWeight);
                vm.advanceGOIState(result.depth);

                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, result.depth, false);
            });
        }

        /**
         * @summary Changes the state of the filters and controls so that only first neighbours 
         * are the focus. Also refreshes the graph so that only first neighbours are shown.
         *
         * @memberOf controllers.MGQueryController
         */
        function backToFirstNeighbours() {
            vm.returnToFirstNeighboursFilter();
            refreshGraph(true);
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
                resetAllData();
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
            if (newValue == vm.displayModes.graph && newValue != oldValue && vm.needsRedraw) {
                $timeout(function() {
                    if (vm.sdWithinTab.config != null && vm.sdWithinTab.cy != null) {
                        GraphConfigService.destroyGraph(MGSharedData);
                        vm.needsRedraw = false;
                        vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyMain");
                    }
                }, 250);
            } else if (newValue == vm.displayModes.graph && newValue != oldValue && !vm.needsRedraw) {
                $timeout(function() {
                    if (vm.sdWithinTab.config != null && vm.sdWithinTab.cy != null) {
                        vm.resize(vm);
                    }
                }, 250);
            }
        });
    }
})();
