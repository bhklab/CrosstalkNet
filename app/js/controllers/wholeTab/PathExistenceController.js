'use strict'

angular.module('myApp.controllers').controller('PathExistenceController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'ExportService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, ExportService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.exportTableToCSV = exportTableToCSV;
        vm.initializeController = initializeController;

        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.sharedData = SharedService.data.global;

        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.display = vm.displayModes.table;
        }

        function exportTableToCSV(tableID) {
            $("." + tableID).tableToCSV();
        }
    }
]);
