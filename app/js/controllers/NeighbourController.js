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
        $scope.inspectNeighbours = function(gene, source) {
            if (gene == null) {
                return;
            }

            if ($scope.genesOfInterest.indexOf(gene) < 0) {
                $scope.genesOfInterest.push(gene);
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
                GraphConfigService.neighbourConfigs.secondDropdownConfig = angular
                    .copy(data.config);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $rootScope.state = $rootScope.states.displayingGraph;
            });
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
        };

        $scope.closeEdgeInspector = GraphConfigService.closeEdgeInspector;
        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $scope.$watch('neighbourConfigs.firstDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour", $scope);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $scope.genesSecond = $scope.loadDropdownOptions($scope.cy, $scope.genesOfInterest);
                $scope.genesOfInterest = [GraphConfigService.firstSelectedGene];
            }
        });

        $scope.$watch('neighbourConfigs.secondDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour", $scope);
                $scope.genesSecond = $scope.loadDropdownOptions($scope.cy, $scope.genesOfInterest);
            }
        });

        $rootScope.$watch('correlationFileActual', function() {
            $scope.genesOfInterest = [];
            $scope.resetInputFields();
            $scope.neighbours = [];
        });
    }
]);
