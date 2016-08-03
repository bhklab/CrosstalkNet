'use strict';
/**
 * Shared data factory for COMMUNITY EXPLORER tab. Allows for sharing of data
 * between controllers within the tab.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('CESharedData', CESharedData);

    /**
     * @namespace CESharedData
     * @desc Factory for facilitating the sharing of data between controllers.
     * @memberOf services
     */
    function CESharedData() {
        var service = {};

        /** Object representing variables to be available between the various controllers
         * within the COMMUNITY EXPLORER tab.
         */
        var withinTabModel = {
            dataLoaded: false,
            cy: null,
            communities: null,
        };

        service.data = angular.copy(withinTabModel);
        service.resetWTM = resetWTM;

        /**
         * @summary Resets the within tab variables for a given view model.
         * This is used for the COMMUNITY EXPLORER tab.
         *
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         */
        function resetWTM(vm) {
            for (var prop in withinTabModel) {
                vm.sdWithinTab[prop] = angular.copy(withinTabModel[prop]);
            }
        }

        return service;
    }
})();
