'use strict';
/**
 * Main graph controls factory. Contains functions that are used for 
 * maniupulating and resetting data within the MGQueryController.
 * @namespace services
 */
(function() {

    angular.module("myApp.services").factory('MainGraphControls', MainGraphControls);

    /**
     * @namespace MainGraphControls
     * @desc Factory for maniupulating and resetting data in the MGQueryController;
     * @memberOf services
     */
    function MainGraphControls(GraphConfigService, MGSharedData, GlobalControls) {
        var service = {};

        service.layouts = [{ display: "Bipartite", value: "preset" }, {
            display: "Concentric",
            value: "clustered"
        }, { display: "Random", value: "random" }];

        service.setMethods = setMethods;

        /**
         * @summary Attaches a group of functions to the given
         * view model. This helps keep controllers slim.
         *
         * @param {Object} vm A view model from a controller.
         */
        function setMethods(vm) {
            vm.addGeneOfInterest = addGeneOfInterest;
            vm.advanceGOIState = advanceGOIState;
            vm.resetGeneSelection = resetGeneSelection;
            vm.resetFilters = resetFilters;
            vm.removeGene = removeGene;
            vm.removeGenesOfInterest = removeGenesOfInterest;
            vm.returnToFirstNeighboursFilter = returnToFirstNeighboursFilter;
            vm.setFilterMinMax = setFilterMinMax;

            /**
             * @summary Adds a gene object to the array of genes of interest.
             *
             * @param {Object} The gene to add.
             */
            function addGeneOfInterest(gene) {
                if (gene != null) {
                    if (vm.genesOfInterest.indexOf(gene) < 0) {
                        vm.genesOfInterest.push(gene);
                    }

                    GlobalControls.resetInputFieldsLocal(vm.ctrl, 'gene-input');
                    GlobalControls.focusElement("md-autocomplete." + vm.ctrl + "gene-input" + " input");
                }
            }

            /**
             * @summary Advances the GOI state to the next stage.
             *
             * @param {Number} depth A number indicating which level of neighbours the data 
             * was obtained for.
             */
            function advanceGOIState(depth) {
                if (vm.GOIState == vm.GOIStates.initial) {
                    vm.GOIState = vm.GOIStates.filterFirst;
                } else if (vm.GOIState == vm.GOIStates.filterFirst && depth == 2) {
                    vm.GOIState = vm.GOIStates.getSecondNeighbours;
                } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
                    vm.GOIState = vm.GOIStates.filterSecond;
                }
            }

            /**
             * @summary Sets the min and max filter bounds for the appropriate
             * filter level based on the given depth.
             *
             * @param {Number} depth A number indicating which level of neighbours the data 
             * was obtained for.
             * @param {Number} min The minimum weight possible.
             * @param {Number} min The maximum weight possible.
             */
            function setFilterMinMax(depth, min, max) {
                if (vm.GOIState == vm.GOIStates.initial) {
                    vm.correlationFilterFirst.min = min;
                    vm.correlationFilterFirst.max = max;
                } else if (vm.GOIState == vm.GOIStates.filterFirst && depth == 2) {
                    vm.correlationFilterSecond.min = min;
                    vm.correlationFilterSecond.max = max;
                }
            }

            /**
             * @summary Re-enables the addition of genes.
             */
            function resetGeneSelection() {
                vm.GOIState = vm.GOIStates.initial;
                vm.resetFilters();
            }

            /**
             * @summary Resets the filters including their limits to the initial
             * values.
             */
            function resetFilters() {
                vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
                vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
            }

            /**
             * @summary Removes a gene object from the array of genes of interest. 
             * Clears the displayed data in the case of genesOfInterest becoming empty,
             * refreshes the graph otherwise.
             *
             * @param {Object} gene The gene to remove.
             */
            function removeGene(gene) {
                if (vm.genesOfInterest.length == 1) {
                    vm.removeGenesOfInterest();
                } else {
                    vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
                    vm.refreshGraph();
                }
            }

            /**
             * @summary Removes all genes of interest and resets all data within the
             * tab.
             */
            function removeGenesOfInterest() {
                vm.genesOfInterest = [];
                resetAllData();
            }

            /**
             * @summary Resets all data within the tab.
             */
            function resetAllData() {
                vm.GOIState = vm.GOIStates.initial;
                vm.allVisibleGenes = [];
                GraphConfigService.destroyGraph(vm);
                GlobalControls.resetInputFieldsLocal(vm.ctrl, '');
                GlobalControls.closeEdgeInspector(vm);
                vm.clearLocatedGene();
                vm.resetFilters();
                MGSharedData.resetWTM(vm);
            }

            /**
             * @summary Enables the user to go back to filtering first
             * neighbours after having already obtained second neighbours.
             */
            function returnToFirstNeighboursFilter() {
                vm.GOIState = vm.GOIStates.filterFirst;
                vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
            }
        }

        return service;
    }

})();
