'use strict';

angular.module('myApp.controllers').controller('PathExistenceController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'ControlsService', 'InitializationService', 'ValidationService', 'SharedService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, ControlsService, InitializationService, ValidationService, SharedService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.ctrl = "pathExistence";
        vm.graphType = "nonDelta";

        InitializationService.initializeCommonVariables(vm);

        vm.genesOfInterest = [];
        vm.pathExplorerSource = null;
        vm.pathExplorerTarget = null;

        vm.pathExplorerTextSource = null;
        vm.pathExplorerTextTarget = null;

        vm.allPaths = null;

        vm.sharedData = SharedService.data.nonDelta;

        vm.setPathExplorerGene = function(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    vm.pathExplorerSource = gene;
                } else {
                    vm.pathExplorerTarget = gene;
                }
            }
        };

        vm.getAllPaths = function() {
            if (vm.pathExplorerTarget == null || vm.pathExplorerSource == null) {
                alert("Please select a source and target gene.");
                return;
            }

            $rootScope.state = $rootScope.states.gettingAllPaths;
            vm.allPaths = null;
            vm.pathTarget = vm.pathExplorerTarget.value;
            vm.pathSource = vm.pathExplorerSource.value;
            RESTService.post('get-all-paths', {
                target: vm.pathExplorerTarget.value,
                source: vm.pathExplorerSource.value,
                fileName: vm.sharedData.correlationFileActual
            }).then(function(data) {
                console.log(data);
                vm.allPaths = data.paths;
                $rootScope.state = $rootScope.states.finishedGettingAllPaths;
                vm.display = "Tables";
                vm.switchModel = true;
            });
        };

        $rootScope.$watch(function() {
            return vm.sharedData.correlationFileActual;
        }, function() {
            vm.genesOfInterest = [];
            //vm.resetInputFields();
            vm.neighbours = [];
            vm.allPaths = null;
        });
    }
]);
