'use strict';

angular.module('myApp.PathExistenceController', []).controller('PathExistenceController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService,
        $q, $timeout) {
        $rootScope.state = $rootScope.states.initial;
        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.ctrl = "pathExistence";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];
        $scope.pathExplorerSource = null;
        $scope.pathExplorerTarget = null;

        $scope.pathExplorerTextSource = null;
        $scope.pathExplorerTextTarget = null;

        $scope.allPaths = null;

        $scope.locateGene = function(gene) {
            if (gene != null && gene != '') {
                $scope.findGeneInGraph($scope, gene);
            }
        };

        $scope.setPathExplorerGene = function(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    $scope.pathExplorerSource = gene;
                } else {
                    $scope.pathExplorerTarget = gene;
                }
            }
        };

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
        };

        $scope.clearLocatedGene = function() {
            GraphConfigService.clearLocatedGene($scope);
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
                file: $rootScope.correlationFileActual
            }).then(function(data) {
                console.log(data);
                $scope.allPaths = data.paths;
                $rootScope.state = $rootScope.states.finishedGettingAllPaths;
                $scope.display = "Tables";
                $scope.switchModel = true;
            });
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.exportTableToCSV = function(tableID) {
            $("#" + tableID).tableToCSV();
        };

        $scope.closeEdgeInspector = GraphConfigService.closeEdgeInspector;
        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $rootScope.$watch('correlationFileActual', function() {
            $scope.genesOfInterest = [];
            $scope.resetInputFields();
            $scope.neighbours = [];
            $scope.allPaths = null;
        });

        // $scope.$watch('display', function(newValue, oldValue) {
        //     if (newValue == 'Graph') {
        //         $timeout(function() {
        //             if ($scope.config != null) {
        //                 $scope.cy.resize(); 
        //                 $scope.needsRedraw = false;
        //                 $scope.applyConfig($scope.config, "cyNeighbour", $scope);
        //             }
        //         }, 250);

        //     }
        // });
    }
]);
