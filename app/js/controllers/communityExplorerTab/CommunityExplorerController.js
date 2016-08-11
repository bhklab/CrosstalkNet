'use strict';
/**
 * Controller for the COMMUNITY EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('CommunityExplorerController', ['GlobalControls',
        'ExportService', 'GlobalSharedData', 'TableService', 'CESharedData', '$filter',
        CommunityExplorerController
    ]);

    /**
     * @namespace CommunityExplorerController
     * @desc Controller for the COMMUNITY EXPLORER tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     * @memberOf controllers
     */
    function CommunityExplorerController(GlobalControls, ExportService, GlobalSharedData, TableService,
        CESharedData, $filter) {
        var vm = this;

        vm.initializeController = initializeController;
        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.switchModel = false;
        vm.sharedData = GlobalSharedData.data;
        vm.changeDisplay = GlobalControls.changeDisplay;

        vm.search = search;
        vm.paginateEpi = paginateEpi;
        vm.paginateStroma = paginateStroma;
        vm.selectCommunity = selectCommunity;
        vm.goToGeneCard = goToGeneCard;


        vm.exportGraphToPNG = ExportService.exportGraphToPNG;
        GlobalControls.setMethodsWholeTab(vm);

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.CommunityExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = CESharedData.data;
            vm.sdWithinTab.display = vm.displayModes.graph;
        }

        function selectCommunity() {
            search("epi");
            search("stroma");
        }

        /**
         * @summary Filters the the genes from the specified tissue type based on the search 
         * query made by the user.
         *
         * @param {String} tissue A string that is either epi or stroma indicating which set
         * of genes is to be filtered.
         *
         */
        function search(tissue) {
            var filtered = [];
            var page = 1;
            var limit = vm.sdWithinTab.pagination[tissue].query.limit;

            vm.sdWithinTab.pagination[tissue].query.page = page;
            filtered = filterGenesByName(vm.sdWithinTab.communities[vm.sdWithinTab.selectedCom][tissue], vm.sdWithinTab.search[tissue]);
            vm.sdWithinTab.filtered[tissue].total = filtered.length;
            // Add code for length here

            vm.sdWithinTab.filtered[tissue].genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Refreshes the displayed list of epi genes based on the new page that was navigated
         * to.
         * 
         * @param {Number} page The new page number.
         * @param {Number} limit The number of genes to limit the result to.
         */
        function paginateEpi(page, limit) {
            var filtered = [];

            filtered = filterGenesByName(vm.sdWithinTab.communities[vm.sdWithinTab.selectedCom].epi, vm.sdWithinTab.search.epi);
            vm.sdWithinTab.filtered.epi.genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Refreshes the displayed list of stroma genes based on the new page that was navigated
         * to.
         * 
         * @param {Number} page The new page number.
         * @param {Number} limit The number of genes to limit the result to.
         */
        function paginateStroma(page, limit) {
            var filtered = [];

            filtered = filterGenesByName(vm.sdWithinTab.communities[vm.sdWithinTab.selectedCom].stroma, vm.sdWithinTab.search.stroma);
            vm.sdWithinTab.filtered.stroma.genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Filters the specified array of genes by a given gene name.
         *
         *
         * @param {Array} genes An array of gene objects.
         * @param {String} name The gene name to filter the array of genes by.
         * @return {Array} An array of gene objects whose properties match the
         * name specified.
         */
        function filterGenesByName(genes, name) {
            var filtered = [];

            filtered = $filter('filter')(genes, name);

            return filtered;
        }

        /** 
         * @summary Filters the specified array of genes to limit them
         * based on the page number that the user is currently on.
         *
         * @param {Array} genes An array of gene objects.
         * @param {Number} page The page that the user is currently on. This
         * is used in combination with the limit to determine which subset 
         * of genes to return.
         * @param {Number} limit The maximum number of genes to return.
         * @return {Array} An array of gene objects that is a subset of 
         * the genes specified limited to the genes for a certain page 
         * number and limit.
         */
        function filterGenesPagination(genes, page, limit) {
            var filtered = [];

            filtered = $filter('limitTo')(genes, limit, (page - 1) * limit)

            return filtered;
        }

        /**
         * @summary Opens the gene card for the specified gene in another tab.
         *
         * @param {String} geneName The gene to open the gene card for.
         */
        function goToGeneCard(geneName) {
            $window.open(GlobalSharedData.geneCardURL + $filter('suffixTrim')(geneName));
        }
    }
})();
