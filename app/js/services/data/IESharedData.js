'use strict';
/**
 * Shared data factory for INTERACTION EXPLORER tab. Allows for sharing of data
 * between controllers within the tab.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('IESharedData', IESharedData);

    /**
     * @namespace IESharedData
     *
     * @desc Factory for facilitating the sharing of data between controllers.
     *
     * @memberOf services
     */
    function IESharedData() {
        var service = {};

        /** Object representing variables to be available between the various controllers within
         * the INTERACTION EXPLORER tab.
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
         * @memberOf services.IESharedData
         */
        function resetWTM() {
            for (var prop in withinTabModel) {
                if (prop != "display" && prop != "selectedTab" && prop != "selectedLayout") {
                    service.data[prop] = withinTabModel[prop];
                }
            }
        }

        return service;
    }
})();
