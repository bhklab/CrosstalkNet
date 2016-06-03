'use strict';

angular.module('myApp.NeighbourController', []).controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, $q, $timeout) {
        $rootScope.selectedTab = 0;
        $scope.selectedItemFirst = null;
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.ctrl = "neighbour";
        $scope.zoomGene = null;
        $scope.searchTextZoom = null;

        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.pValues = angular.copy(BasicDataService.pValues);
        $scope.layouts = angular.copy(BasicDataService.layouts);

        $scope.minDegree = {
            first: 0,
            second: 0
        }
        $rootScope.state = $rootScope.states.initial;
        $scope.totalInteractions = null;
        $scope.selfLoops = [];
        $scope.selfLoopsCount = 0;

        $scope.display = "Graph";
        $scope.switchModel = false;
        $scope.selectedLayout = $scope.layouts[1].value;

        $scope.selectedNeighbourGenes = [];

        $scope.resize = GraphConfigService.resetZoom;

        $scope.getSelfLoops = GraphConfigService.getSelfLoops;
        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        $scope.querySearch = BasicDataService.querySearch;
        $scope.getNodesWithMinDegree = BasicDataService.getNodesWithMinDegree;
        $scope.getInteractingNodes = GraphConfigService.getInteractingNodes;
        $scope.locateGeneInGraph = GraphConfigService.locateGeneInGraph;


        // $scope.applyConfig = function(config, containerID) {
        //     $scope.elemCopy = angular.copy(config.elements);
        //     config.container = document.getElementById(containerID);
        //     $scope.cy = cytoscape(config);
        //     $scope.cy.fit($scope.cy.$("*"), 10);
        // };

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

        $scope.inspectNeighbours = function(gene, source) {
            if (gene == null) {
                return;
            }

            if ($scope.selectedNeighbourGenes.indexOf(gene) < 0) {
                $scope.selectedNeighbourGenes.push(gene);
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
                selectedGenes: $scope.selectedNeighbourGenes,
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
            $scope.selectedNeighbourGenes.splice($scope.selectedNeighbourGenes.indexOf(gene), 1);
        };

        $scope.closeEdgeInspector = GraphConfigService.closeEdgeInspector;
        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $scope.$watch('neighbourConfigs.firstDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour", $scope);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $scope.genesSecond = $scope.loadDropdownOptions($scope.cy, $scope.selectedNeighbourGenes);
                $scope.selectedNeighbourGenes = [GraphConfigService.firstSelectedGene];
            }
        });

        $scope.$watch('neighbourConfigs.secondDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour", $scope);
                $scope.genesSecond = $scope.loadDropdownOptions($scope.cy, $scope.selectedNeighbourGenes);
            }
        });

        $rootScope.$watch('correlationFileActual', function() {
            $scope.selectedNeighbourGenes = [];
            $scope.resetInputFields();
            $scope.neighbours = [];
        });
    }
]);
