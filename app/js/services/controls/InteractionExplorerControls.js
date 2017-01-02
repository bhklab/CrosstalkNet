'use strict';
/**
 * Interaction explorer controls factory. Contains functions that are used for 
 * maniupulating and resetting data within the IEQueryController.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('InteractionExplorerControls', InteractionExplorerControls);

    /**
     * @namespace InteractionExplorerControls
     *
     * @desc Factory for maniupulating and resetting data in the IEQueryController;
     *
     * @memberOf services
     */
    function InteractionExplorerControls(GraphConfigService, IESharedData, GlobalControls) {
        var service = {};

        service.layouts = [{ display: "Bipartite", value: "preset" }, { display: "Random", value: "random" }];
        service.setMethods = setMethods;

        /**
         * @summary Attaches a group of functions to the given
         * view model. This helps keep controllers slim.
         *
         * @param {Object} vm A view model from a controller.
         *
         * @memberOf services.InteractionExplorerControls
         */
        function setMethods(vm) {
            vm.addGeneOfInterest = addGeneOfInterest;
            vm.initializeVariables = initializeVariables;
            vm.loadExplorerDropdownOptions = loadExplorerDropdownOptions;

            /**
             * @summary Initializes variables used within the tab for binding to the controls.
             */
            function initializeVariables() {
                vm.zoomGene = null;
                vm.searchTextGOI = "";
                vm.searchTextFirst = "";
                vm.searchTextZoom = "";

                vm.displayModes = angular.copy(GlobalControls.displayModes);

                vm.genesOfInterest = [];
                vm.explorerGenes = [];

                vm.query = {
                    limit: 5,
                    page: 1
                };

                vm.sdWithinTab.showGraphSummary = false;
                vm.allowAdditionalGenes = true;
            }

            /**
             * @summary Adds a gene object to the array of genes of interest.
             *
             * @param {Object} The gene to add.
             */
            function addGeneOfInterest(gene) {
                if (gene != null) {
                    if (vm.genesOfInterest.indexOf(gene) < 0 && vm.allowAdditionalGenes == true) {
                        vm.genesOfInterest.push(gene);
                        vm.allowAdditionalGenes = false;
                    }
                }
            }

            /**
             * @summary Creates an array of gene objects
             * avaialbe for search in the INTERACTION EXPLORER
             * autocomplete control.
             *
             * @param {Array} selectedGenes An array of gene objects
             * indicating which genes should not be available in 
             * the autocomplete control.
             */
            function loadExplorerDropdownOptions(selectedGenes) {
                var genes = [];

                if (vm.sdWithinTab.cy == null || selectedGenes == null) {
                    return [];
                }

                vm.sdWithinTab.cy.edges("[source='" + selectedGenes[selectedGenes.length - 1].value + "']").forEach(function(
                    edge) {
                    genes.push(edge.target().data());
                });

                return genes.map(function(gene) {
                    return {
                        value: gene.id,
                        display: gene.id + ' ' + gene.degree,
                        object: gene
                    };
                });
            }
        }

        return service;
    }
})();
