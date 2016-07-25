'use strict';
/**
 * Controller for the PATH EXISTENCE CHECKER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('PathExistenceController', [
        'GraphConfigService', 'GlobalControls', 'SharedService', 'PESharedData',
        PathExistenceController
    ]);

    /**
     * @namespace PathExistenceController
     * @desc Controller for the PATH EXISTENCE CHECKER tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     * @memberOf controllers
     */
    function PathExistenceController(GraphConfigService, GlobalControls, SharedService, PESharedData) {
        var vm = this;

        vm.exportTableToCSV = exportTableToCSV;
        vm.initializeController = initializeController;

        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.sharedData = SharedService.data.global;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.PathExistenceController
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
         * @memberOf controllers.PathExistenceController
         */
        function exportTableToCSV(tableID) {
            $("." + tableID).tableToCSV();
        }
    }
})();
