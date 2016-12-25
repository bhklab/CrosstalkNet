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
            vm.returnToFirstNeighboursFilter = returnToFirstNeighboursFilter;
            vm.setFilterMinMax = setFilterMinMax;
            vm.initializeVariables = initializeVariables;
            vm.validateFilterInput = validateFilterInput;

            /**
             * @summary Initializes variables used within the tab for binding to the controls.
             *
             * @memberOf controllers.MGQueryController
             */
            function initializeVariables() {
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

                vm.query = {
                    limit: 5,
                    page: 1
                };

                vm.sdWithinTab.showGraphSummary = false;
            }

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
             * @summary Enables the user to go back to filtering first
             * neighbours after having already obtained second neighbours.
             */
            function returnToFirstNeighboursFilter() {
                vm.GOIState = vm.GOIStates.filterFirst;
                vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
            }

            function validateFilterInput() {
                if (vm.correlationFilterFirst.negativeFilter !== undefined && vm.correlationFilterFirst.positiveFilter !== undefined &&
                    vm.correlationFilterSecond.negativeFilter !== undefined && vm.correlationFilterSecond.positiveFilter !== undefined) {
                    if (isNaN(vm.correlationFilterFirst.negativeFilter) || isNaN(vm.correlationFilterFirst.positiveFilter) ||
                        isNaN(vm.correlationFilterSecond.negativeFilter) || isNaN(vm.correlationFilterSecond.positiveFilter)) {
                        alert("One of the filter values is not a number. Please enter a proper decimal value.");
                        return false;
                    }
                }

                if (vm.correlationFilterFirst.negativeFilter === undefined) {
                    alert("First neighbours negative filter has a value outside of legal range. Please adjust this value so that it is between " + vm.correlationFilterFirst.min + " and 0");
                    return false;
                } else if (vm.correlationFilterFirst.positiveFilter === undefined) {
                    alert("First neighbours positive filter has a value outside of legal range. Please adjust this value so that it is between 0 and " + vm.correlationFilterFirst.max);
                    return false;
                } else if (vm.correlationFilterSecond.negativeFilter === undefined) {
                    alert("Second neighbours negative filter has a value outside of legal range. Please adjust this value so that it is between " + vm.correlationFilterSecond.min + " and 0");
                    return false;
                } else if (vm.correlationFilterSecond.positiveFilter === undefined) {
                    alert("Second neighbours positive filter has a value outside of legal range. Please adjust this value so that it is between 0 and " + vm.correlationFilterSecond.max);
                    return false;
                }

                if (vm.correlationFilterFirst.negativeFilter < vm.correlationFilterFirst.min || vm.correlationFilterFirst.negativeFilter > 0 ||
                    vm.correlationFilterFirst.positiveFilter > vm.correlationFilterFirst.max || vm.correlationFilterFirst.positiveFilter < 0 ||
                    vm.correlationFilterSecond.negativeFilter < vm.correlationFilterSecond.min || vm.correlationFilterSecond.negativeFilter > 0 ||
                    vm.correlationFilterSecond.positiveFilter > vm.correlationFilterSecond.max || vm.correlationFilterSecond.positiveFilter < 0) {
                    alert("Filter values must be in appropriate range. Ensure negative filter values are negative and don't go below the minumum. \
                        Ensure that positive filter values are positive and don't go above the maximum.");
                    return false;
                }

                return true;
            }
        }

        return service;
    }

})();
