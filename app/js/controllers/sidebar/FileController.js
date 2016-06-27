'use strict';

angular.module('myApp.controllers').controller('FileController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'ControlsService', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, ControlsService, InitializationService, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.sharedData = SharedService.data.nonDelta;

        vm.correlationFileDisplayed = null;
        vm.getFileList = QueryService.getFileList;
        vm.getGeneList = QueryService.getGeneList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;

        $scope.init = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
        };

        $scope.$watch(function() {
            return vm.sharedData.correlationFileActual;
        }, function(newValue, oldValue) {
            ControlsService.resetInputFieldsGlobal(vm);

            if (newValue != "" && newValue != null && newValue != oldValue) {
                QueryService.getGeneList(newValue).then(function(result) {
                    vm.sharedData.geneList = result.geneList;
                });

                QueryService.getMatrixSummary(newValue).then(function(result) {
                    vm.sharedData.matrixSummary = result.matrixSummary;
                });
            }
        });
        $scope.$watch(function() {
            return vm.sharedData.reloadFileList;
        }, function(newValue, oldValue) {
            if (newValue == true) {
                QueryService.getFileList(['tumor', 'normal']).then(function(result) {
                    vm.fileList = result.fileList;
                });
                vm.sharedData.reloadFileList = false;
            }
        });
    }
]);
