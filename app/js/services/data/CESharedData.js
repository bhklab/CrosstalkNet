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
     *
     * @desc Factory for facilitating the sharing of data between controllers.
     *
     * @memberOf services
     */
    function CESharedData() {
        var service = {};

        var paginationModel = {
            options: {
                rowSelection: true,
                multiSelect: true,
                autoSelect: true,
                decapitate: false,
                largeEditDialog: false,
                boundaryLinks: false,
                limitSelect: true,
                pageSelect: true
            },
            query: {
                limit: 50,
                page: 1
            },
            limitOptions: [50, 100, 200]
        };

        /** Object representing variables to be available between the various controllers
         * within the COMMUNITY EXPLORER tab.
         */
        var withinTabModel = {
            dataLoaded: false,
            cy: null,
            config: null,
            communities: null,
            communityNumbers: null,
            pagination: { epi: angular.copy(paginationModel), stroma: angular.copy(paginationModel) },
            filtered: { epi: { genes: null, total: 0 }, stroma: { genes: null, total: 0 } },
            search: { epi: "", stroma: "" },
            selectedCom: null
        };

        service.data = angular.copy(withinTabModel);
        service.resetWTM = resetWTM;

        /**
         * @summary Resets the within tab variables for a given view model.
         * This is used for the COMMUNITY EXPLORER tab.
         *
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         *
         * @memberOf services.CESharedData
         */
        function resetWTM() {
            for (var prop in withinTabModel) {
                if (prop == "pagination") {
                    service.data[prop].epi = angular.copy(paginationModel);
                    service.data[prop].stroma = angular.copy(paginationModel);
                }

                service.data[prop] = angular.copy(withinTabModel[prop]);
            }
        }

        return service;
    }
})();
