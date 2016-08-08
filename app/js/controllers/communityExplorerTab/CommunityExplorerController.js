'use strict';
/**
 * Controller for the COMMUNITY EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('CommunityExplorerController', ['GlobalControls', 
        'ExportService', 'GlobalSharedData', 'TableService', 'CESharedData',
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
        CESharedData) {
        var vm = this;

        vm.initializeController = initializeController;
        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.switchModel = false;
        vm.sharedData = GlobalSharedData.data;
        vm.changeDisplay = GlobalControls.changeDisplay;
        
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
    }
})();
