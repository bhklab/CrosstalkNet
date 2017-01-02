'use strict';
/**
 * Shared data factory for MAIN GRAPH tab. Allows for sharing of data
 * between controllers within the tab.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('MGSharedData', MGSharedData);

    /**
     * @namespace MGSharedData
     *
     * @desc Factory for facilitating the sharing of data between controllers.
     *
     * @memberOf services
     */
    function MGSharedData() {
        var service = {};

        /** Object representing variables to be available between the various controllers within
         * the MAIN GRAPH tab.
         */
        var withinTabModel = {
            cy: null,
            config: null,
            edgeDictionary: null,
            display: null,
            allVisibleGenes: [],
            neighbours: null,
            selectedLayout: null,
            graphSummary: null,
            selfLoops: null,
            selectedTab: 0,
            showGraphSummary: false,
            selectedEdge: null,
            selfLoopSearch: ""
        };

        service.data = angular.copy(withinTabModel);

        service.resetWTM = resetWTM;


        /**
         * @summary Resets the within tab variables for a given view model. 
         *
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         *
         * @memberOf services.MGSharedData
         */
        function resetWTM(vm) {
            for (var prop in withinTabModel) {
                if (prop != "display" && prop != "selectedTab" && prop != "selectedLayout") {
                    vm.sdWithinTab[prop] = angular.copy(withinTabModel[prop]);
                }
            }
        }

        return service;
    }
})();
