'use strict';

angular.module('myApp.controllers').controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', 'ExportService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService, ExportService,
        $q, $timeout) {
        $scope.ctrl = "neighbour";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];
        $scope.pathExplorerSource = null;
        $scope.pathExplorerTarget = null;

        $scope.pathExplorerTextSource = null;
        $scope.pathExplorerTextTarget = null;

        $scope.allPaths = null;
        $scope.config = null;

        $scope.needsRedraw = false;
        $scope.applyConfig = GraphConfigService.applyConfig;

        $scope.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        $scope.exportGraphToPNG = ExportService.exportGraphToPNG;

        $scope.allowAdditionalGenes = true;
        $scope.showGraphSummary = false;

        $scope.init = function(whichController) {
            $scope.whichController = whichController;
        };

        $scope.locateGene = function(gene) {
            if (gene != null && gene != '') {
                $scope.findGeneInGraph($scope, gene);
            }
        };

        $scope.closeEdgeInspector = function() {
            $scope.selectedEdge = {};
        };

        $scope.changeDisplay = function() {
            if ($scope.display == $scope.displayModes.graph) {
                $scope.display = $scope.displayModes.table;
            } else {
                $scope.display = $scope.displayModes.graph;
            }
        };

        $scope.addGeneOfInterest = function(gene) {
            if (gene != null) {
                if ($scope.genesOfInterest.indexOf(gene) < 0 && $scope.allowAdditionalGenes == true) {
                    $scope.genesOfInterest.push(gene);
                    $scope.allowAdditionalGenes = false;
                }
            }
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
        };

        $scope.clearLocatedGene = function() {
            $scope.resetInputFieldsLocal('geneLocator');
            GraphConfigService.clearLocatedGene($scope);
        }

        $scope.getConfigForSelectedNeighbours = function() {
            var level = $scope.genesOfInterest.length;
            $rootScope.state = $rootScope.states.loadingGraph;
            $scope.showGraphSummary = false;
            $scope.resetDisplayedData();
            RESTService.post('neighbour-general', {
                layout: $scope.selectedLayout,
                selectedGenes: $scope.genesOfInterest,
                fileName: $rootScope.correlationFilesActual[$scope.whichController]
            }).then(function(data) {
                console.log(data);

                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                if ($scope.display == $scope.displayModes.table) {
                    $scope.needsRedraw = true;
                }
                $scope.applyConfig(data.config, "cyNeighbour" + $scope.whichController, $scope);
                $scope.selfLoops = data.selfLoops;
                $scope.edgeDictionary = data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                $scope.explorerGenes = BasicDataService.loadExplorerDropdownOptions($scope, $scope.genesOfInterest);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $rootScope.state = $rootScope.states.showingGraph;

                $scope.setNeighboursGeneral($scope, level, true);
                $scope.allowAdditionalGenes = true;

                $scope.showGraphSummary = true;
            });
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
            if ($scope.genesOfInterest.length == 0) {
                if ($scope.cy) {
                    $scope.cy.destroy();
                }
                $scope.cy = null;
            } else {
                $scope.getConfigForSelectedNeighbours();
            }

            $scope.allowAdditionalGenes = true;
            $scope.resetDisplayedData();
        };

        $scope.removeAllGenes = function() {
            $scope.allowAdditionalGenes = true;
            $scope.genesOfInterest = [];
            if ($scope.cy) {
                $scope.cy.destroy();
            }
            $scope.cy = null;
            $scope.resetDisplayedData();
        };

        $scope.getInteractionViaDictionary = function(source, target) {
            if ($scope.edgeDictionary[source] != null && $scope.edgeDictionary[source][target] != null) {
                return $scope.edgeDictionary[source][target];
            } else if ($scope.edgeDictionary[target] != null && $scope.edgeDictionary[target][source] != null) {
                return $scope.edgeDictionary[target][source];
            } else {
                return 0;
            }
        };

        $scope.resetDisplayedData = function() {
            $scope.closeEdgeInspector();
            $scope.allVisibleGenes = [];
            $scope.explorerGenes = [];
            $scope.selfLoops = [];
            $scope.neighbours = [];
            $scope.resetInputFieldsLocal('');
            $scope.clearLocatedGene();
            $scope.showGraphSummary = false;
        };

        $scope.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        $scope.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $rootScope.$watch(function() {
            return $rootScope.correlationFilesActual[$scope.whichController];
        }, function() {
            $scope.genesOfInterest = [];
            $scope.resetDisplayedData();
            if ($scope.cy) {
                $scope.cy.destroy();
            }
            $scope.cy = null;
        });

        $scope.$watch('display', function(newValue, oldValue) {
            if (newValue == 'Graph') {
                $timeout(function() {
                    if ($scope.config != null) {
                        $scope.cy.resize();
                        $scope.needsRedraw = false;
                        $scope.applyConfig($scope.config, "cyNeighbour" + $scope.whichController, $scope);
                    }
                }, 250);

            }
        });
    }
]);
