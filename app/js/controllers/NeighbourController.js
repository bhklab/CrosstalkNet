'use strict';

angular.module('myApp.NeighbourController', []).controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, $q, $timeout) {
        $rootScope.selectedTab = 0;
        $rootScope.state = $rootScope.states.initial;
        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.ctrl = "neighbour";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];
        $scope.pathExplorerSource = null;
        $scope.pathExplorerTarget = null;

        $scope.pathExplorerTextSource = null;
        $scope.pathExplorerTextTarget = null;

        $scope.allPaths = null;

        $scope.applyConfig = GraphConfigService.applyConfig;

        $scope.locateGene = function(gene) {
            if (gene != null && gene != '') {
                $scope.findGeneInGraph($scope, gene);
            }
        };

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Tables";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.addGeneOfInterest = function(gene) {
            if (gene != null) {
                if ($scope.genesOfInterest.indexOf(gene) < 0) {
                    $scope.genesOfInterest.push(gene);
                }
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
        }

        $scope.getConfigForSelectedNeighbours = function() {
            $rootScope.state = $rootScope.states.loadingSecond;
            RESTService.post('neighbour-general', {
                layout: $scope.selectedLayout,
                selectedGenes: $scope.genesOfInterest,
                file: $rootScope.correlationFileActual
            }).then(function(data) {
                console.log(data);
                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.neighbours = angular.copy($scope.genesSecond);
                $scope.applyConfig(data.config, "cyNeighbour", $scope);
                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                $scope.genesSecond = $scope.loadNeighbourDropdownOptions($scope.cy, $scope.genesOfInterest);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $rootScope.state = $rootScope.states.displayingGraph;
            });
        };

        $scope.getAllPaths = function() {
            $rootScope.state = $rootScope.states.loading;
            $scope.pathTarget = $scope.pathExplorerTarget.value;
            $scope.pathSource = $scope.pathExplorerSource.value;
            RESTService.post('get-all-paths', {
                target: $scope.pathExplorerTarget.value,
                source: $scope.pathExplorerSource.value,
                file: $rootScope.correlationFileActual
            }).then(function(data) {
                console.log(data);
                $scope.allPaths = data.paths;
            });
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
        };

        $scope.closeEdgeInspector = GraphConfigService.closeEdgeInspector;
        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $rootScope.$watch('correlationFileActual', function() {
            $scope.genesOfInterest = [];
            $scope.resetInputFields();
            $scope.neighbours = [];
        });
    }
]);
