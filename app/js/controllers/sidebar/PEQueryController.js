'use strict';

angular.module('myApp.controllers').controller('PEQueryController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', 'PathExistenceControls', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, InitializationService, ValidationService, SharedService, QueryService, PathExistenceControls,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initialize = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            initializeVariables();
        };

        function initializeVariables() {
            vm.pathExplorerSource = null;
            vm.pathExplorerTarget = null;

            vm.pathExplorerTextSource = "";
            vm.pathExplorerTextTarget = "";

            vm.sdWithinTab.allPaths = null;
        }

        vm.sharedData = SharedService.data.global;
        PathExistenceControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        vm.setPathExplorerGene = function(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    vm.pathExplorerSource = gene;
                } else {
                    vm.pathExplorerTarget = gene;
                }
            }
        };

        vm.refreshPaths = function() {
            if (vm.pathExplorerTarget == null || vm.pathExplorerSource == null) {
                alert("Please select a source and target gene.");
                return;
            }

            SharedService.resetWTMPE(vm);
            vm.sdWithinTab.pathTargetCached = vm.pathExplorerTarget.value;
            vm.sdWithinTab.pathSourceCached = vm.pathExplorerSource.value;
            QueryService.getAllPaths(vm).then(function(result) {
                if (result.allPaths == null) {
                    return;
                }

                vm.sdWithinTab.allPaths = result.allPaths;
                vm.sdWithinTab.types = result.types;
                $rootScope.state = $rootScope.states.finishedGettingAllPaths;
            });
        }

        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                initializeVariables();
                SharedService.resetWTMPE(vm);
            }
        });
    }
]);
