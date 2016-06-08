'use strict';

angular.module('myApp.NeighbourController', []).controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService,
        $q, $timeout) {
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
        $scope.config = null;

        $scope.needsRedraw = false;
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
            $rootScope.state = $rootScope.states.loadingGraph;
            RESTService.post('neighbour-general', {
                layout: $scope.selectedLayout,
                selectedGenes: $scope.genesOfInterest,
                file: $rootScope.correlationFileActual
            }).then(function(data) {
                console.log(data);

                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.neighbours = angular.copy($scope.genesSecond);
                if ($scope.display == "Tables") {
                    $scope.needsRedraw = true;
                }
                $scope.applyConfig(data.config, "cyNeighbour", $scope);
                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                $scope.genesSecond = $scope.loadNeighbourDropdownOptions($scope.cy, $scope.genesOfInterest);
                $scope.allVisibleGenes = $scope.getAllVisibleGenes($scope);
                $rootScope.state = $rootScope.states.showingGraph;
            });
        };

        $scope.getAllPaths = function() {
            if ($scope.pathExplorerTarget == null || $scope.pathExplorerSource == null) {
                alert("Please select a source and target gene.");
                return;
            }

            $rootScope.state = $rootScope.states.gettingAllPaths;
            $scope.allPaths = [];
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

        $scope.removeGene = function(gene) {
            $scope.genesOfInterest.splice($scope.genesOfInterest.indexOf(gene), 1);
        };

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
        });

        $scope.$watch('display', function(newValue, oldValue) {
            if (newValue == 'Graph') {
                $timeout(function() {
                    if ($scope.config != null) {
                        $scope.cy.resize(); 
                        $scope.needsRedraw = false;
                        $scope.applyConfig($scope.config, "cyNeighbour", $scope);
                    }
                }, 250);

            }
        });
    }
]);
