'use strict';
/**
 * Shared data factory for DEGREE EXPLORER tab. Allows for sharing of data
 * between controllers within the tab.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('DESharedData', DESharedData);

    /**
     * @namespace DESharedData
     *
     * @desc Factory for facilitating the sharing of data between controllers.
     *
     * @memberOf services
     */
    function DESharedData() {
        var service = {};

        /** Object representing variables to be available between the various controllers
         * within the DEGREE EXPLORER tab.
         */
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
            limitOptions: [50, 100, 200],
            label: {page: 'Page:', of: 'of', rowsPerPage: 'Results per page:'}
        };

        var withinTabModel = {
            dataLoaded: false,
            filterAmount: 1,
            filterType: null,
            topGenes: null,
            filtered: { epi : {genes: null, total: 0}, stroma: {genes: null, total: 0} },
            pagination: { epi: angular.copy(paginationModel), stroma: angular.copy(paginationModel) },
            search: {epi: "", stroma: ""}
        };

        service.data = angular.copy(withinTabModel);
        service.resetWTM = resetWTM;

        /**
         * @summary Resets the within tab variables for a given view model.
         * This is used for the DEGREE EXPLORER tab.
         *
         * @memberOf services.DESharedData
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
