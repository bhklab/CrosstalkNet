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

        $scope.initialize = function(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.layouts = angular.copy(GlobalControls.layouts[vm.ctrl]);
            vm.startingLayout = angular.copy(GlobalControls.startingLayouts[vm.ctrl]);
            vm.sdWithinTab.selectedLayout = vm.layouts[0].value;
        };
    }
]);
