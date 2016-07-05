'use strict';

angular.module('myApp.controllers').controller('FileController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.sharedData = SharedService.data.global;
        vm.fileList = { normal: null, tumor: null, delta: null };

        vm.correlationFileDisplayed = null;
        vm.selectedNetworkType = vm.sharedData.selectedNetworkType;

        vm.getFileList = QueryService.getFileList;
        vm.getGeneList = QueryService.getGeneList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;

        vm.initialize = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
        };

        vm.getGenes = function() {
            vm.sharedData.clearAllData = true;
            vm.sharedData.selectedNetworkType = vm.selectedNetworkType;
            GlobalControls.resetInputFieldsGlobal(vm);

            QueryService.getGeneList(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.geneList = result.geneList;
            });

            QueryService.getMatrixSummary(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.matrixSummary = result.matrixSummary;
                vm.sharedData.clearAllData = false;
                vm.sdWithinTab.selectedTab = 1;
            });
        };

        $scope.$watch(function() {
                return vm.selectedNetworkType; },
            function(newValue, oldValue) {
                if (newValue != oldValue && newValue != null) {
                    SharedService.resetCorrelationFiles();
                    vm.sharedData.clearAllData = true;
                }
            });

        // $scope.$watch(function() {
        //     return vm.sharedData.correlationFileActual;
        // }, function(newValue, oldValue) {
        //     GlobalControls.resetInputFieldsGlobal(vm);

        //     if (newValue != "" && newValue != null && newValue != oldValue) {
        //         QueryService.getGeneList(newValue).then(function(result) {
        //             vm.sharedData.geneList = result.geneList;
        //         });

        //         QueryService.getMatrixSummary(newValue).then(function(result) {
        //             vm.sharedData.matrixSummary = result.matrixSummary;
        //         });

        //         vm.sdWithinTab.selectedTab = 1;
        //     }
        // });
        $scope.$watch(function() {
            return vm.sharedData.reloadFileList;
        }, function(newValue, oldValue) {
            if (newValue == true) {
                QueryService.getFileList(['tumor', 'normal', 'delta']).then(function(result) {
                    vm.fileList.normal = result.fileList.normal;
                    vm.fileList.tumor = result.fileList.tumor;
                    vm.fileList.delta = result.fileList.delta;
                });
                vm.sharedData.reloadFileList = false;
            }
        });
    }
]);
