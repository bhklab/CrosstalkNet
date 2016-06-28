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
            initializeVariables();
        };

        vm.sharedData = SharedService.data.nonDelta;
        vm.exportTableToCSV = ExportService.exportTableToCSV;
    }
]);
