'use strict';
/**
 * Controller for the DATA sub-tab in the MAIN GRAPH tab.
 * @namespace 
 */
(function() {
    angular.module('myApp.controllers').controller('MGDataController', [
        '$scope',
        '$mdDialog', '$mdSelect', '$rootScope',
        'GlobalControls', 'GlobalSharedData', 'QueryService', 'FileUploadService', '$timeout',
        'MGSharedData',
        MGDataController
    ]);

    /**
     * @namespace MGDataController
     *
     * @desc Controller for getting, uploading, and deleting files.
     *
     * @memberOf controllers
     */
    function MGDataController($scope, $mdDialog, $mdSelect, $rootScope, GlobalControls, GlobalSharedData, QueryService, FileUploadService,
        $timeout, MGSharedData) {
        var vm = this;
        vm.scope = $scope;

        $rootScope.dataLoaded = false;

        vm.sharedData = GlobalSharedData.data;
        vm.fileList = { normal: null, tumor: null, delta: null };

        vm.selectedNetworkType = vm.sharedData.selectedNetworkType;
        vm.postFixes = {colPost: "S", rowPost: "E"};

        vm.getFileList = QueryService.getFileList;
        vm.getGeneList = QueryService.getGeneList;
        vm.getOverallMatrixStats = QueryService.getOverallMatrixStats;
        vm.showTooltip = { button: false };

        vm.deleteConfirm = deleteConfirm;
        vm.getGenes = getGenes;
        vm.initializeController = initializeController;
        vm.uploadFiles = uploadFiles;

        /**
         * @summary Initializes variables used within the tab for referring to selected
         * files.
         *
         * @memberOf controllers.MGDataController
         */
        function initializeVariables() {
            vm.correlationFileDisplayed = { normal: null, tumor: null, delta: null };
            vm.matrixUpload = { normal: null, tumor: null, delta: null };
        }

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.MGDataController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = MGSharedData.data;
            initializeVariables();
        }

        /**
         * @summary Checks to see if the all of the necessary files have been selected
         * in order to retrieve data for the selected network type.
         *
         * @return {Boolean} true if all the necessary files have been specified, false otherwise.
         *
         * @memberOf controllers.MGDataController
         */
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

        /**
         * @summary Checks to see if all of the necessary files have been selected
         * in order to upload the data to the server.
         *
         * @return {Boolean} true if all of the necessary files have been specified, false otherwise.
         *
         * @memberOf controllers.MGDataController
         */
        function checkFilesToUpload() {
            if (vm.postFixes.colPost == vm.postFixes.rowPost) {
                alert("Row and column suffices must be different.")
                return false;
            }

            if (vm.postFixes.colPost.indexOf("-") >= 0 || vm.postFixes.rowPost.indexOf("-") >= 0) {
                alert("Row and column sufficies must not contain dashes (-).")
                return false;
            }

            if (vm.postFixes.colPost.length == 0 || vm.postFixes.colPost.length > 2 || vm.postFixes.rowPost.length == 0 
                || vm.postFixes.rowPost.length > 2) {
                alert("Row and column suffices must be 1 to 2 characters in length.")
                return false;
            }


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

        /**
         * @summary Spawns a confirm dialog asking the user if they really want to 
         * delete the file they clicked on.
         *
         * @param {Event} ev The event associated with the click. This is used to prevent
         * propogation.
         * @param {Object} file The file that is to be deleted.
         *
         * @memberOf controllers.MGDataController
         */
        function deleteConfirm(ev, file) {
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
                QueryService.deleteMatrixFile(toDelete);

                if ((vm.sharedData.correlationFileActual.normal != null &&
                        vm.sharedData.correlationFileActual.normal == file.name) ||
                    (vm.sharedData.correlationFileActual.tumor != null &&
                        vm.sharedData.correlationFileActual.tumor.name == file.name) ||
                    (vm.sharedData.correlationFileActual.delta != null &&
                        vm.sharedData.correlationFileActual.delta.name == file.name)) {
                    GlobalControls.resetInputFieldsGlobal();
                    GlobalSharedData.resetGlobalData();
                    $rootScope.state = $rootScope.states.waitingForInputFiles;
                }

            }, function() {});

            GlobalControls.focusElement("md-dialog button.ng-enter-active");
        }

        /**
         * @summary Obtains necessary information for the selected files and network type.
         *
         * @memberOf controllers.MGDataController
         */
        function getGenes() {
            if (!checkFilesSelected()) {
                return;
            }

            if (stopTutorial) {
                stopTutorial();
            }

            GlobalSharedData.resetMatrixSummary();
            GlobalSharedData.resetGeneList();
            vm.showTooltip.button = false;
            vm.sharedData.clearAllData = true;
            vm.sharedData.selectedNetworkType = vm.selectedNetworkType;
            vm.sharedData.correlationFileActual.normal = JSON.parse(vm.correlationFileDisplayed.normal);
            vm.sharedData.correlationFileActual.tumor = JSON.parse(vm.correlationFileDisplayed.tumor);
            vm.sharedData.correlationFileActual.delta = JSON.parse(vm.correlationFileDisplayed.delta);
            GlobalControls.resetInputFieldsGlobal();

            $rootScope.state = $rootScope.states.initial;

            getGeneList();
            getMatrixSummary();
        }

        /**
         * @summary Sends a request to the server to obtain the gene list for the selected files
         * and network type.
         *
         * @memberOf controllers.MGDataController
         */
        function getGeneList() {
            QueryService.getGeneList(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.geneList = result.geneList;
                vm.sharedData.maxDegree = result.maxDegree;
                vm.sharedData.rowPost = result.rowPost;
                vm.sharedData.colPost = result.colPost;
                $rootScope.dataLoaded = true;
                vm.sdWithinTab.selectedTab = 1;
                stopTutorial();
            });
        }

        /**
         * @summary Sends a request to the server to obtain the matrix summary for the selected files
         * and network type.
         *
         * @memberOf controllers.MGDataController
         */
        function getMatrixSummary() {
            QueryService.getMatrixSummary(vm.sharedData.correlationFileActual).then(function(result) {
                vm.sharedData.matrixSummary = result.matrixSummary;
                vm.sharedData.clearAllData = false;
            });
        }

        /**
         * @summary Shows a tooltip from the GET GENES button.
         *
         * @memberOf controllers.MGDataController
         */
        function showTooltip() {
            stopTutorial();
            $timeout(function() {
                vm.showTooltip.button = true;
            }, 250);
        }

        /**
         * @summary Uploads the specified files to the server.
         *
         * @memberOf controllers.MGDataController
         */
        function uploadFiles() {
            if (!checkFilesToUpload()) {
                return;
            }

            $rootScope.state = $rootScope.states.uploadingFile;
            FileUploadService.uploadMatrixFiles(vm.matrixUpload, vm.selectedNetworkType, vm.postFixes).then(function(result) {
                $rootScope.state = $rootScope.states.waitingForInputFiles;
                vm.matrixUpload = { normal: null, tumor: null, delta: null };
                GlobalControls.resetInputFieldsGlobal();
                GlobalSharedData.resetGlobalData();
                initializeVariables();
                vm.sharedData.reloadMatrixFileList = true;
            });
        }

        /**
         * @summary Watched for changes in the network type and resets data in all tabs in the case
         * of a change.
         *
         * @memberOf controllers.MGDataController
         */
        $scope.$watch(function() {
                return vm.selectedNetworkType;
            },
            function(newValue, oldValue) {
                if (newValue != oldValue && newValue != null) {
                    GlobalSharedData.resetGraphs();
                    GlobalControls.resetInputFieldsGlobal();
                    GlobalSharedData.resetGlobalData();
                    GlobalSharedData.resetWTModels();
                    initializeVariables();
                    $rootScope.state = $rootScope.states.waitingForInputFiles;
                    vm.showTooltip.button = false;
                }
            });

        /**
         * @summary Wacthes for changes in the reloadMatrixFileList variable and reloads the available
         * file dropdowns as well as the user permission level when reloadMatrixFileList becomes true.
         *
         * @memberOf controllers.MGDataController
         */
        $scope.$watch(function() {
            return vm.sharedData.reloadMatrixFileList;
        }, function(newValue, oldValue) {
            if (newValue == true) {
                QueryService.getFileList(['tumor', 'normal', 'delta']).then(function(result) {
                    if (result.fileList != null) {
                        vm.fileList.normal = result.fileList.normal;
                        vm.fileList.tumor = result.fileList.tumor;
                        vm.fileList.delta = result.fileList.delta;
                    }
                });

                QueryService.getUserPermission().then(function(result) {
                    vm.sharedData.permission = result.permission;
                });
                vm.sharedData.reloadMatrixFileList = false;
            }
        });

        /**
         * @summary Watches for changes in the correlationFileDisplayed variable and shows a tooltip
         * once the appropriate files are selected.
         *
         * @memberOf controllers.MGDataController
         */
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
    }
})();
