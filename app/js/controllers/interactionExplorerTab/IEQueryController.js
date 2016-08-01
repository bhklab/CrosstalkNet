'use strict';
/**
 * Controller for the DATA sub-tab in the MAIN GRAPH tab.
 * @namespace controllers
 */

(function() {
    angular.module('myApp.controllers').controller('IEQueryController', [
        '$scope',
        '$rootScope',
        'GraphConfigService', 'InteractionExplorerControls', 'GlobalControls', 'GlobalSharedData', 'TableService', 'QueryService', '$timeout',
        'IESharedData',
        IEQueryController
    ]);

    /**
     * @namespace IEQueryController
     * @desc Controller for the QUERY sub-tab in the INTERACTION EXPLORER tab.
     * @memberOf controllers
     */
    function IEQueryController($scope, $rootScope, GraphConfigService, InteractionExplorerControls, GlobalControls, GlobalSharedData, TableService,
        QueryService, $timeout, IESharedData) {
        var vm = this;
        vm.scope = $scope;
        vm.allowAdditionalGenes = true;

        vm.initializeController = initializeController;
        vm.removeGene = removeGene;
        vm.removeAllGenes = removeAllGenes;
        vm.refreshGraph = refreshGraph;

        vm.sharedData = GlobalSharedData.data;

        InteractionExplorerControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.IEQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = IESharedData.data;
            vm.initializeVariables();
        }

        /**
         * @summary Removes a gene object from the array of genes of interest. 
         * Clears the displayed data in the case of genesOfInterest becoming empty,
         * refreshes the graph otherwise.
         *
         * @param {Object} gene The gene to remove.
         */
        function removeGene(gene) {
            vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
            if (vm.genesOfInterest.length == 0) {
                GraphConfigService.destroyGraph(vm);
            } else {
                vm.refreshGraph();
            }

            vm.allowAdditionalGenes = true;
            resetDisplayedData();
        }

        /**
         * @summary Empties the genes of interest and
         * resets data within the tab.
         */
        function removeAllGenes() {
            vm.allowAdditionalGenes = true;
            vm.genesOfInterest = [];
            GraphConfigService.destroyGraph(vm);
            resetDisplayedData();
        }

        /**
         * @summary Resets the data within the tab.
         */
        function resetDisplayedData() {
            vm.allVisibleGenes = [];
            vm.explorerGenes = [];
            GlobalControls.resetInputFieldsLocal(vm.ctrl, '');
            vm.clearLocatedGene();
            IESharedData.resetWTM(vm);
        }

        /**
         * @summary Resets the data shown within the INTERACTION EXPLORER tab and
         * obtains a cytoscape.js config for the current user query.
         *
         * @memberOf controllers.IEQueryController
         */
        function refreshGraph() {
            resetDisplayedData();
            IESharedData.resetWTM(vm);
            getConfigForGraph();
        }

        /**
         * @summary Obtains a cytoscpape.js config from the server for the current
         * user query.
         *
         * @memberOf controllers.IEQueryController
         */
        function getConfigForGraph() {
            QueryService.getInteractionExplorerConfig(vm).then(function(result) {
                if (result.data == null) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                if (vm.sdWithinTab.display == vm.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, result.data.config, "cyInteractionExplorer");
                vm.sdWithinTab.selfLoops = result.data.selfLoops;
                vm.sdWithinTab.edgeDictionary = result.data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                vm.explorerGenes = vm.loadExplorerDropdownOptions(vm.genesOfInterest);
                vm.sdWithinTab.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm.sdWithinTab.cy);
                $rootScope.state = $rootScope.states.showingGraph;

                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, result.level, true);
                vm.allowAdditionalGenes = true;

                vm.sdWithinTab.showGraphSummary = true;
            });
        }

        /**
         * @summary Watches the clearAllData variable and clears the data within the tab when 
         * it changes to true.
         *
         * @memberOf controllers.IEQueryController
         */
        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                vm.genesOfInterest = [];
                GraphConfigService.destroyGraph(vm);
                resetDisplayedData();
            }
        });

        /** 
         * @summary Watches the selectedLayout variable and refreshes the graph when the 
         * layout changes.
         *
         * @memberOf controllers.IEQueryController
         */
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

        /** 
         * @summary Watches the display variable and redraws the graph when switching
         * from the Tables view to the Graph view.
         *
         * @memberOf controllers.IEQueryController
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
                        GraphConfigService.destroyGraph(vm);
                        vm.needsRedraw = false;
                        vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyInteractionExplorer");
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
