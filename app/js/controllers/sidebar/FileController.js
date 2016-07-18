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

        vm.selectedNetworkType = vm.sharedData.selectedNetworkType;

        vm.getFileList = QueryService.getFileList;
        vm.getGeneList = QueryService.getGeneList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;
        vm.showTooltip = { button: false };

        $rootScope.dataLoaded = false;

        function initializeVariables() {
            vm.correlationFileDisplayed = { normal: null, tumor: null, delta: null };
            vm.matrixUpload = { normal: null, tumor: null, delta: null };
        }

        function checkFilesSelected() {
            if (vm.selectedNetworkType == vm.sharedData.networkTypes.delta &&
                (!vm.correlationFileDisplayed.normal || !vm.correlationFileDisplayed.tumor || !vm.correlationFileDisplayed.delta)) {
                alert("Please choose all 3 files for the delta network");
                return false;
            } else if (vm.selectedNetworkType == vm.sharedData.networkTypes.normal && !vm.correlationFileDisplayed.normal) {
                alert("Please choose normal tissue file");
                return false;
            } else if (vm.selectedNetworkType == vm.sharedData.networkTypes.tumor && !vm.correlationFileDisplayed.tumor) {
                alert("Please choose tumor tissue file");
                return false;
            }

            return true;
        }

        function checkFilesToUpload() {
            if (vm.selectedNetworkType == vm.sharedData.networkTypes.delta &&
                (!vm.matrixUpload.normal || !vm.matrixUpload.tumor || !vm.matrixUpload.delta)) {
                alert("Please choose all 3 Rdata files to upload delta network");
                return false;
            } else if (vm.selectedNetworkType == vm.sharedData.networkTypes.normal && !vm.matrixUpload.normal) {
                alert("Please choose an Rdata file to upload normal network");
                return false;
            } else if (vm.selectedNetworkType == vm.sharedData.networkTypes.tumor && !vm.matrixUpload.tumor) {
                alert("Please choose an Rdata file to upload tumor network");
                return false;
            }

            return true;
        }

        vm.initialize = function(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            initializeVariables();
        };

        vm.getGenes = function() {
            if (!checkFilesSelected()) {
                return;
            }

            stopTutorial();
            vm.showTooltip.button = false;
            vm.sharedData.clearAllData = true;
            vm.sharedData.selectedNetworkType = vm.selectedNetworkType;
            vm.sharedData.correlationFileActual.normal = JSON.parse(vm.correlationFileDisplayed.normal);
            vm.sharedData.correlationFileActual.tumor = JSON.parse(vm.correlationFileDisplayed.tumor);
            vm.sharedData.correlationFileActual.delta = JSON.parse(vm.correlationFileDisplayed.delta);
            GlobalControls.resetInputFieldsGlobal(vm);

            QueryService.getGeneList(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.geneList = result.geneList;
                $rootScope.dataLoaded = true;
                vm.sdWithinTab.selectedTab = 1;
                stopTutorial();
            });

            QueryService.getMatrixSummary(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.matrixSummary = result.matrixSummary;
                vm.sharedData.clearAllData = false;
            });
        };

        vm.uploadFiles = function() {
            if (!checkFilesToUpload()) {
                return;
            }

            $rootScope.state = $rootScope.states.uploadingFile;
            FileUploadService.uploadFiles(vm.matrixUpload, vm.selectedNetworkType).then(function(result) {
                $rootScope.state = $rootScope.states.initial;
                vm.matrixUpload = { normal: null, tumor: null, delta: null };
            });
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
                .textContent('Are you sure you want to delete the file: ' + file.name + '?')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .clickOutsideToClose(false)
                .escapeToClose(false)
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                QueryService.deleteFile(toDelete);
            }, function() {});

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
                    initializeVariables();
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

        var stopTutorial = $scope.$watch(function() {
            return vm.correlationFileDisplayed;
        }, function(newValue, oldValue) {
            if (vm.selectedNetworkType == vm.sharedData.networkTypes.delta) {
                if (newValue.delta != null && newValue.normal != null && newValue.tumor != null) {
                    showTooltip();
                }
            } else if (newValue.delta != null || newValue.normal != null || newValue.tumor != null) {
                showTooltip();
            }
        }, true);

        function showTooltip() {
            stopTutorial();
            $timeout(function() {
                vm.showTooltip.button = true;
            }, 250);
        }
    }
]);
