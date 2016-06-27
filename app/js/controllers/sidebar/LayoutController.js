'use strict';

angular.module('myApp.controllers').controller('LayoutController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'ControlsService', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, ControlsService, InitializationService, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.resize = GraphConfigService.resetZoom;

        vm.layouts = angular.copy(ControlsService.layouts);

        $scope.init = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.selectedLayout = vm.layouts.main[0].value;
        };
    }
]);
