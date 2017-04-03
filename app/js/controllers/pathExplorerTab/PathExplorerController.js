'use strict';
/**
 * Controller for the PATH EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('PathExplorerController', [
        'GlobalControls', 'GlobalSharedData', 'PESharedData', 'ExportService',
        PathExplorerController
    ]);

    /**
     * @namespace PathExplorerController
     *
     * @desc Controller for the PATH EXPLORER tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     *
     * @memberOf controllers
     */
    function PathExplorerController(GlobalControls, GlobalSharedData, PESharedData, ExportService) {
        var vm = this;

        vm.exportAllPathsToCSV = ExportService.exportAllPathsToCSV;
        vm.initializeController = initializeController;

        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.sharedData = GlobalSharedData.data;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.PathExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = PESharedData.data;
            vm.sdWithinTab.display = vm.displayModes.table;
        }

        /**
         * @summary Exports the HTML table with the specified ID to a csv file.
         *
         * @param {String} tableID The ID of the table to export to csv.
         *
         * @memberOf controllers.PathExplorerController
         */
        function exportTableToCSV(tableID) {
            $("." + tableID).tableToCSV();
        }
    }
})();
