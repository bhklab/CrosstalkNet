'use strict';
/**
 * Controller for the MAIN GRAPH tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('MainGraphController', ['$scope',
        '$rootScope', 'RESTService',
        'GraphConfigService', 'GlobalControls', 'ExportService', 'FileUploadService', 'ValidationService', 'SharedService', 'TableService', 'QueryService', '$q', '$timeout', '$cookies',
        '$mdDialog',
        MainGraphController
    ]);

    /**
     * @namespace MainGraphController
     * @desc Controller for the MAIN GRAPH tab. Its main
     * purpose is to allow the sharing of data throughout the different 
     * controls and tables in the tab.
     * @memberOf controllers
     */
    function MainGraphController($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, ExportService, FileUploadService, ValidationService, SharedService, TableService, QueryService,
        $q, $timeout, $cookies, $mdDialog) {
        var vm = this;
        vm.scope = $scope;

        $rootScope.selectedTab = 0;

        vm.initializeController = initializeController;
        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.switchModel = false;
        vm.sharedData = SharedService.data.global;
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
         * @memberOf controllers.MainGraphController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.display = vm.displayModes.graph;
        }
    }
})();
