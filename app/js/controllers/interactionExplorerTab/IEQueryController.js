'use strict';
/**
 * Controller for the DATA sub-tab in the MAIN GRAPH tab.
 * @namespace controllers
 */

(function() {
    angular.module('myApp.controllers').controller('IEQueryController', [
        '$scope',
        '$rootScope',
        'GraphConfigService', 'InteractionExplorerControls', 'GlobalControls', 'SharedService', 'TableService', 'QueryService', '$timeout',
        'IESharedData',
        IEQueryController
    ]);

    /**
     * @namespace IEQueryController
     * @desc Controller for the QUERY sub-tab in the INTERACTION EXPLORER tab.
     * @memberOf controllers
     */
    function IEQueryController($scope, $rootScope, GraphConfigService, InteractionExplorerControls, GlobalControls, SharedService, TableService,
        QueryService, $timeout, IESharedData) {
        var vm = this;
        vm.scope = $scope;
        vm.allowAdditionalGenes = true;

        vm.initializeController = initializeController;
        vm.refreshGraph = refreshGraph;

        vm.sharedData = SharedService.data.global;

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
            initializeVariables();
        }

        /**
         * @summary Initializes variables used within the tab for binding to the controls.
         *
         * @memberOf controllers.IEQueryController
         */
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

        /**
         * @summary Resets the data shown within the INTERACTION EXPLORER tab and
         * obtains a cytoscape.js config for the current user query.
         *
         * @memberOf controllers.IEQueryController
         */
        function refreshGraph() {
            vm.resetDisplayedData();
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
                if (vm.display == vm.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, result.data.config, "cyInteractionExplorer");
                vm.sdWithinTab.selfLoops = result.data.selfLoops;
                vm.sdWithinTab.edgeDictionary = result.data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                vm.explorerGenes = vm.loadExplorerDropdownOptions(vm.genesOfInterest);
                vm.allVisibleGenes = GlobalControls.getAllVisibleGenes(vm.sdWithinTab.cy);
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
                vm.resetDisplayedData();
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

})();
