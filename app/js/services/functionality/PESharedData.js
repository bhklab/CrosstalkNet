'use strict';
/**
 * Shared data factory for PATH EXISTENCE CHEKCER tab. Allows for sharing of data
 * between controllers within the tab.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('PESharedData', PESharedData);

    /**
     * @namespace PESharedData
     * @desc Factory for facilitating the sharing of data between controllers.
     * @memberOf services
     */
    function PESharedData() {
        var service = {};

        var tableOrderModel = { weight: "-'firstEdge.weight'", normal: "-'firstEdge.normal'", tumor: "-'firstEdge.tumor'" };

        /** Object representing variables to be available between the various controllers within
         * the PATH EXISTENCE CHEKCER tab.
         */
        var withinTabModel = {
            pathSourceCached: null,
            pathTargetCached: null,
            allPaths: null,
            display: null,
            types: null,
            tableOrder: angular.copy(tableOrderModel)
        };

        service.data = angular.copy(withinTabModel);

        service.resetWTM = resetWTM;


        /**
         * @summary Resets the within tab variables for a given view model. 
         *
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         */
        function resetWTM(vm) {
            for (var prop in withinTabModel) {
                if (prop == "tableOrder") {
                    vm.sdWithinTab[prop] = angular.copy(tableOrderModel);
                } else if (prop != "display") {
                    vm.sdWithinTab[prop] = withinTabModel[prop];
                }
            }
        }

        return service;
    }
})();
