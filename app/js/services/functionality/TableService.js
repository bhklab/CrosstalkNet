'use strict';
/**
 * Table information retrieval factory. Contains functions for 
 * getting interaction strengths and grouping them by neighbour
 * level for the tables.
 * @namespace services
 */


(function() {
    angular.module("myApp.services").factory('TableService', TableService);

    /**
     * @namespace TableService
     * @desc Factory for getting interactions to be displayed in tables.
     * @memberOf services
     */
    function TableService() {
        var service = {};

        service.getInteractionViaDictionary = getInteractionViaDictionary;
        service.getNeighboursGeneral = getNeighboursGeneral;
        service.getNeighboursFromEdges = getNeighboursFromEdges;

        /**
         * @summary Gets the interaction strength between the source
         * and target genes via the edge dictionary for the view model.
         *
         * @param {Object} vm A view model whose within-tab shared data edge 
         * dictionary will be used to get the interaction strength.
         * @param {String} source The gene name of the source gene.
         * @param {String} target The gene name of the target gene.
         * @param {String} matType The type of network to get the interaction for.
         * This is required especially for delta networks in order to determine
         * which of the network types to show the interaction strength for.
         */
        function getInteractionViaDictionary(vm, source, target, matType) {
            if (vm.sdWithinTab.edgeDictionary == null) {
                return;
            }

            if (vm.sdWithinTab.edgeDictionary[source] != null && vm.sdWithinTab.edgeDictionary[source][target] != null) {
                return vm.sdWithinTab.edgeDictionary[source][target][matType];
            } else if (vm.sdWithinTab.edgeDictionary[target] != null && vm.sdWithinTab.edgeDictionary[target][source] != null) {
                return vm.sdWithinTab.edgeDictionary[target][source][matType];
            } else {
                return 0;
            }
        }

        /**
         * @summary Gets an array of gene names for every level of 
         * neighbours up to the specified highest neighbour level.
         *
         * @param {Object} vm A view model for the controller calling the function.
         * @param {Number} highestLevel The highest neighbour level for which to 
         * obtain the neighbours
         * @return {Array} An array of objects. These objects have 2 properties, epi
         * and stroma, whose values are both arrays containing the gene names
         * for a certain neighbour level of neighbours.
         */
        function getNeighboursGeneral(vm, highestLevel) {
            var neighbours = [];

            for (var i = 1; i <= highestLevel; i++) {
                var temp = getNeighboursFromEdges(vm, i);

                neighbours.push(temp);
            }

            return neighbours;
        }

        /**
         * @summary Gets the gene names associated with a certain level of 
         * neighbours.
         *
         * @param {Object} vm A view model whose cytoscape edges will be 
         * used to obtain the genes for the given neighbour level.
         * @param {Number} level The neighbour level to obtain the gene
         * names for.
         * @return {Object} An object containing 2 arrays: one for epi
         * genes and one for stroma genes. These arrays contain strings
         * which are the gene names of nodes relevant to a certain level
         * of neighbours.
         */
        function getNeighboursFromEdges(vm, level) {
            var neighbours = { epi: new Set(), stroma: new Set() };
            var edges = vm.sdWithinTab.cy.filter(function(i, element) {
                if (element.isEdge() && element.data('neighbourLevel') == level) {
                    return true;
                }

                return false;
            });

            for (var i = 0; i < edges.length; i++) {
                if (edges[i].data('source').endsWith("-E")) {
                    neighbours.epi.add(edges[i].data('source'));
                    neighbours.stroma.add(edges[i].data('target'));
                } else {
                    neighbours.epi.add(edges[i].data('target'));
                    neighbours.stroma.add(edges[i].data('source'));
                }
            }

            neighbours.epi = Array.from(neighbours.epi);
            neighbours.stroma = Array.from(neighbours.stroma);

            return neighbours;
        }

        return service;
    }
})();
