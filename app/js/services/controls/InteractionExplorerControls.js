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
     * @desc Factory for maniupulating and resetting data in the IEQueryController;
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
         */
        function setMethods(vm) {
            vm.addGeneOfInterest = addGeneOfInterest;
            vm.removeGene = removeGene;
            vm.removeAllGenes = removeAllGenes;
            vm.resetDisplayedData = resetDisplayedData;
            vm.loadExplorerDropdownOptions = loadExplorerDropdownOptions;

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
                vm.resetDisplayedData();
            }

            /**
             * @summary Empties the genes of interest and
             * resets data within the tab.
             */
            function removeAllGenes() {
                vm.allowAdditionalGenes = true;
                vm.genesOfInterest = [];
                GraphConfigService.destroyGraph(vm);
                vm.resetDisplayedData();
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
