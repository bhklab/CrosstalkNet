'use strict';

angular.module('myApp.controllers').controller('PathExistenceController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', 'SharedService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService, SharedService,
        $q, $timeout) {
        $scope.ctrl = "pathExistence";
        $scope.graphType = "nonDelta";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];
        $scope.pathExplorerSource = null;
        $scope.pathExplorerTarget = null;

        $scope.pathExplorerTextSource = null;
        $scope.pathExplorerTextTarget = null;

        $scope.allPaths = null;

        $scope.sharedData = SharedService.data.nonDelta;

        $scope.setPathExplorerGene = function(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    $scope.pathExplorerSource = gene;
                } else {
                    $scope.pathExplorerTarget = gene;
                }
            }
        };

        $scope.getAllPaths = function() {
            if ($scope.pathExplorerTarget == null || $scope.pathExplorerSource == null) {
                alert("Please select a source and target gene.");
                return;
            }

            $rootScope.state = $rootScope.states.gettingAllPaths;
            $scope.allPaths = null;
            $scope.pathTarget = $scope.pathExplorerTarget.value;
            $scope.pathSource = $scope.pathExplorerSource.value;
            RESTService.post('get-all-paths', {
                target: $scope.pathExplorerTarget.value,
                source: $scope.pathExplorerSource.value,
                fileName: $scope.sharedData.correlationFileActual
            }).then(function(data) {
                console.log(data);
                $scope.allPaths = data.paths;
                $rootScope.state = $rootScope.states.finishedGettingAllPaths;
                $scope.display = "Tables";
                $scope.switchModel = true;
            });
        };

        $rootScope.$watch(function() {
            return $scope.sharedData.correlationFileActual;
        }, function() {
            $scope.genesOfInterest = [];
            //$scope.resetInputFields();
            $scope.neighbours = [];
            $scope.allPaths = null;
        });
    }
]);
