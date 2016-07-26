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
     * @desc Controller for the DEGREE EXPLORER tab.
     * @memberOf controllers
     */
    function DegreeExplorerController($scope, $window, $filter, GlobalSharedData, DESharedData, ExportService) {
        var vm = this;
        vm.sharedData = GlobalSharedData.data;

        vm.initializeController = initializeController;
        vm.goToGeneCard = goToGeneCard;
        vm.exportTopGenesToCSV = ExportService.exportTopGenesToCSV;
        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.DegreeExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = DESharedData.data;
        }

        /**
         * @summary Opens the gene card for the specified gene in another tab.
         *
         * @param {Object} gene The gene to open the gene card for.
         */
        function goToGeneCard(gene) {
            $window.open(GlobalSharedData.geneCardURL + $filter('suffixTrim')(gene.value));
        }
    }
})();
