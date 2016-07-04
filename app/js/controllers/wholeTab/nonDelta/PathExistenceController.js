'use strict';

angular.module('myApp.controllers').controller('PathExistenceController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'ExportService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, ExportService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initialize = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.display = vm.displayModes.table;
        };

        vm.exportTableToCSV = function(tableID) {
            $("." + tableID).tableToCSV();
        };

        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.sharedData = SharedService.data.global;
    }
]);
