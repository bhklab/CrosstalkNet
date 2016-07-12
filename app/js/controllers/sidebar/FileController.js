'use strict';

angular.module('myApp.controllers').controller('FileController', [
    '$scope',
    '$mdDialog', '$mdSelect', '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', 'FileUploadService', '$q', '$timeout',
    function($scope, $mdDialog, $mdSelect, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, QueryService, FileUploadService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.sharedData = SharedService.data.global;
        vm.fileList = { normal: null, tumor: null, delta: null };

        vm.correlationFileDisplayed = { normal: null, tumor: null, delta: null };
        vm.selectedNetworkType = vm.sharedData.selectedNetworkType;

        vm.getFileList = QueryService.getFileList;
        vm.getGeneList = QueryService.getGeneList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;

        vm.matrixUpload = { normal: null, tumor: null, delta: null };

        vm.initialize = function(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
        };

        vm.getGenes = function() {
            vm.sharedData.clearAllData = true;
            vm.sharedData.selectedNetworkType = vm.selectedNetworkType;
            vm.sharedData.correlationFileActual.normal = JSON.parse(vm.correlationFileDisplayed.normal);
            vm.sharedData.correlationFileActual.tumor = JSON.parse(vm.correlationFileDisplayed.tumor);
            vm.sharedData.correlationFileActual.delta = JSON.parse(vm.correlationFileDisplayed.delta);
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

        vm.uploadFiles = function() {
            $rootScope.state = $rootScope.states.uploadingFile;
            FileUploadService.uploadFiles(vm.matrixUpload, vm.selectedNetworkType).then(function(result) {
                $rootScope.state = $rootScope.states.initial;
            });
            vm.matrixUpload = { normal: null, tumor: null, delta: null };
        };

        vm.deleteConfirm = function(ev, file) {
            var toDelete = {};
            
            for (var prop in file) {
                if (prop.indexOf("$") < 0) {
                    toDelete[prop] = file[prop];
                }
            }

            ev.stopPropagation();
            $mdSelect.hide();

            var confirm = $mdDialog.confirm()
                .title('Confirm Delete?')
                .textContent('Are you sure you want to delete the file: ' + file.name +  '?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .clickOutsideToClose(false)
                .escapeToClose(false)
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                QueryService.deleteFile(toDelete);
                elem.removeClass('hide');
            }, function() {
                elem.removeClass('hide');
            });

            GlobalControls.focusElement("md-dialog button.ng-enter-active");
        };

        $scope.$watch(function() {
                return vm.selectedNetworkType;
            },
            function(newValue, oldValue) {
                if (newValue != oldValue && newValue != null) {
                    SharedService.resetCorrelationFiles();
                    vm.sharedData.clearAllData = true;
                    SharedService.resetMatrixSummary();
                }
            });

        $scope.$watch(function() {
            return vm.sharedData.reloadFileList;
        }, function(newValue, oldValue) {
            if (newValue == true) {
                QueryService.getFileList(['tumor', 'normal', 'delta']).then(function(result) {
                    vm.fileList.normal = result.fileList.normal;
                    vm.fileList.tumor = result.fileList.tumor;
                    vm.fileList.delta = result.fileList.delta;
                });

                QueryService.getUserPermission().then(function(result) {
                    vm.permission = result.permission;
                });
                vm.sharedData.reloadFileList = false;
            }
        });
    }
]);
