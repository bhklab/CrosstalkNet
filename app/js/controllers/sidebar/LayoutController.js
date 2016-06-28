'use strict';

angular.module('myApp.controllers').controller('LayoutController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.resize = GraphConfigService.resetZoom;

        $scope.init = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.layouts = angular.copy(GlobalControls.layouts[vm.ctrl]);
            vm.sdWithinTab.selectedLayout = vm.layouts[0].value;
        };
    }
]);
