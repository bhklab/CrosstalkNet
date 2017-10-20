'use strict';
/**
 * Controller for the DEGREE EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('DegreeExplorerController', [
        '$scope', '$window', '$filter', 'GlobalSharedData', 'DESharedData', 'ExportService',
        DegreeExplorerController
    ]);

    /**
     * @namespace DegreeExplorerController
     *
     * @desc Controller for the DEGREE EXPLORER tab.
     *
     * @memberOf controllers
     */
    function DegreeExplorerController($scope, $window, $filter, GlobalSharedData, DESharedData, ExportService) {
        var vm = this;
        vm.sharedData = GlobalSharedData.data;

        vm.initializeController = initializeController;
        vm.goToGeneCard = goToGeneCard;
        vm.exportTopGenesToCSV = ExportService.exportTopGenesToCSV;

        vm.search = search;
        vm.paginateRow = paginateRow;
        vm.paginateCol = paginateCol;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.DegreeExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = DESharedData.data;
        }

        /**
         * @summary Filters the the genes from the specified tissue type based on the search 
         * query made by the user.
         *
         * @param {String} tissue A string that is either row or col indicating which set
         * of genes is to be filtered.
         *
         * @memberOf controllers.DegreeExplorerController
         */
        function search(tissue) {
            var filtered = [];
            var page = 1;
            var limit = vm.sdWithinTab.pagination[tissue].query.limit;

            vm.sdWithinTab.pagination[tissue].query.page = page;
            filtered = filterGenesByName(vm.sdWithinTab.topGenes[tissue], vm.sdWithinTab.search[tissue]);
            vm.sdWithinTab.filtered[tissue].total = filtered.length;
            // Add code for length here

            vm.sdWithinTab.filtered[tissue].genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Refreshes the displayed list of row genes based on the new page that was navigated
         * to.
         * 
         * @param {Number} page The new page number.
         * @param {Number} limit The number of genes to limit the result to.
         *
         * @memberOf controllers.DegreeExplorerController
         */
        function paginateRow(page, limit) {
            var filtered = [];

            filtered = filterGenesByName(vm.sdWithinTab.topGenes.row, vm.sdWithinTab.search.row);
            vm.sdWithinTab.filtered.row.genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Refreshes the displayed list of col genes based on the new page that was navigated
         * to.
         * 
         * @param {Number} page The new page number.
         * @param {Number} limit The number of genes to limit the result to.
         *
         * @memberOf controllers.DegreeExplorerController
         */
        function paginateCol(page, limit) {
            var filtered = [];

            filtered = filterGenesByName(vm.sdWithinTab.topGenes.col, vm.sdWithinTab.search.col);
            vm.sdWithinTab.filtered.col.genes = filterGenesPagination(filtered, page, limit);
        }

        /**
         * @summary Filters the specified array of genes by a given gene name.
         *
         *
         * @param {Array} genes An array of gene objects.
         * @param {String} name The gene name to filter the array of genes by.
         * @return {Array} An array of gene objects whose properties match the
         * name specified.
         *
         * @memberOf controllers.DegreeExplorerController
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
         *
         * @memberOf controllers.DegreeExplorerController
         */ 
        function filterGenesPagination(genes, page, limit) {
            var filtered = [];

            filtered = $filter('limitTo')(genes, limit, (page - 1) * limit)

            return filtered;
        }

        /**
         * @summary Opens the gene card for the specified gene in another tab.
         *
         * @param {Object} gene The gene to open the gene card for.
         *
         * @memberOf controllers.DegreeExplorerController
         */
        function goToGeneCard(gene) {
            $window.open(GlobalSharedData.geneCardURL + $filter('suffixTrim')(gene.value));
        }

        $scope.$watch('vm.sdWithinTab.dataLoaded', function(newValue, oldValue) {
            if (newValue != oldValue && oldValue == false) {
                search('row');
                search('col');
            }
        })
    }
})();
