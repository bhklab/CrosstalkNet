'use strict';
/**
 * Controller for the MAIN GRAPH tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('MainGraphController', ['$scope',
        '$rootScope',
        'GlobalControls', 'ExportService', 'GlobalSharedData', 'TableService',
        '$mdDialog', 'MGSharedData',
        MainGraphController
    ]);

    /**
     * @namespace MainGraphController
     *
     * @desc Controller for the MAIN GRAPH tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     *
     * @memberOf controllers
     */
    function MainGraphController($scope, $rootScope, GlobalControls, ExportService, GlobalSharedData, TableService,
        $mdDialog, MGSharedData) {
        var vm = this;
        vm.scope = $scope;

        $rootScope.selectedTab = 0;

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
         * @memberOf controllers.MainGraphController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = MGSharedData.data;
            vm.sdWithinTab.display = vm.displayModes.graph;
        }
    }
})();
