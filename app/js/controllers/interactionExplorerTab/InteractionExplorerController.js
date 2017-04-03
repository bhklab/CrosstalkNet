'use strict';
/**
 * Controller for the INTERACTION EXPLORER TAB tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('InteractionExplorerController', ['GlobalControls',
        'ExportService', 'GlobalSharedData', 'TableService', 'IESharedData',
        InteractionExplorerController
    ]);

    /**
     * @namespace InteractionExplorerController
     *
     * @desc Controller for the INTERACTION EXPLORER tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     *
     * @memberOf controllers
     */
    function InteractionExplorerController(GlobalControls, ExportService, GlobalSharedData, TableService,
        IESharedData) {
        var vm = this;

        vm.initializeController = initializeController;
        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.switchModel = false;
        vm.sharedData = GlobalSharedData.data;
        vm.changeDisplay = GlobalControls.changeDisplay;
        vm.closeEdgeInspector = GlobalControls.closeEdgeInspector;
        vm.getInteractionViaDictionary = TableService.getInteractionViaDictionary;
        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.InteractionExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = IESharedData.data;
            vm.sdWithinTab.display = vm.displayModes.graph;
        }
    }
})();
