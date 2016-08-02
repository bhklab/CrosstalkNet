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
                limit: 10,
                page: 1,
                order: ''
            },
            limitOptions: [10, 15, 20]
        };

        var weight = angular.copy(paginationModel);
        weight.query.order = "-'firstEdge.weight'";
        var normal = angular.copy(paginationModel); 
        normal.query.order = "-'firstEdge.normal'";
        var tumor = angular.copy(paginationModel);
        tumor.query.order = "-'firstEdge.tumor'"; 

        /** Object representing variables to be available between the various controllers within
         * the PATH EXISTENCE CHEKCER tab.
         */
        var withinTabModel = {
            pathSourceCached: null,
            pathTargetCached: null,
            allPaths: null,
            display: null,
            types: null,
            pagination: {weight: angular.copy(weight), normal: angular.copy(normal), tumor: angular.copy(tumor)}
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
                if (prop != "display") {
                    vm.sdWithinTab[prop] = angular.copy(withinTabModel[prop]);
                }
            }
        }

        return service;
    }
})();
