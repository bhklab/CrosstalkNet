'use strict';
/**
 * Path explorer factory. Contains functions that are used for 
 * maniupulating and resetting data within the PEQueryController.
 * @namespace services
 */
(function() {
    angular.module('myApp.services').factory('PathExplorerControls', PathExplorerControls);

    /**
     * @namespace PathExplorerControls
     *
     * @desc Factory for maniupulating and resetting data in the PEQueryController;
     *
     * @memberOf services
     */
    function PathExplorerControls() {
        var service = {};

        service.setMethods = setMethods;

        /**
         * @summary Attaches a group of functions to the given
         * view model. This helps keep controllers slim.
         *
         * @param {Object} vm A view model from a controller.
         *
         * @memberOf services.PathExplorerControls
         */
        function setMethods(vm) {
            /**
             * @summary Sets either the path explorer checker source
             * or target gene depending on which autocomplete control
             * the request came from.
             *
             * @param {Object} gene The gene that was selected from the
             * autocomplete control.
             * @param {String} which A string used to indicate which autocomplete
             * control the request came from. 
             */
            vm.setPathExplorerGene = function(gene, which) {
                if (gene != null) {
                    if (which == 'source') {
                        vm.pathExplorerSource = gene;
                    } else {
                        vm.pathExplorerTarget = gene;
                    }
                }
            };
        };

        return service;
    }
})();
