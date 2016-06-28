'use strict';

angular.module('myApp.controllers').controller('MainController', ['$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'ExportService', 'FileUploadService', 'InitializationService', 'ValidationService', 'SharedService', 'TableService', 'QueryService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, ExportService, FileUploadService, InitializationService, ValidationService, SharedService, TableService, QueryService,
        $q, $timeout, $cookies, $mdDialog) {
        $rootScope.selectedTab = 0;
        $rootScope.geneLists = { nonDelta: null, delta: null };
        $rootScope.states = angular.copy(GlobalControls.states);
        $rootScope.state = $rootScope.states.initial;

        var vm = this;
        vm.scope = $scope;

        $scope.initialize = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.sdWithinTab.display = vm.displayModes.graph;
        };

        vm.displayModes = angular.copy(GlobalControls.displayModes);
        vm.switchModel = false;
        vm.sharedData = SharedService.data.nonDelta;
        vm.changeDisplay = GlobalControls.changeDisplay;
        vm.closeEdgeInspector = GlobalControls.closeEdgeInspector;
        vm.getInteractionViaDictionary = TableService.getInteractionViaDictionary;
        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;
    }
]);
