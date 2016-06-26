'use strict';

angular.module('myApp.controllers').controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', 'ExportService', 'SharedService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService, ExportService, SharedService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.ctrl = "neighbour";
        vm.graphType = "nonDelta";

        InitializationService.initializeCommonVariables(vm);

        vm.genesOfInterest = [];
        vm.pathExplorerSource = null;
        vm.pathExplorerTarget = null;

        vm.pathExplorerTextSource = null;
        vm.pathExplorerTextTarget = null;

        vm.allPaths = null;
        vm.config = null;

        vm.needsRedraw = false;
        vm.applyConfig = GraphConfigService.applyConfig;

        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;

        vm.sharedData = SharedService.data.nonDelta;

        vm.allowAdditionalGenes = true;
        vm.showGraphSummary = false;

        vm.init = function(whichController) {
            vm.whichController = whichController;
        };

        vm.locateGene = function(gene) {
            if (gene != null && gene != '') {
                vm.findGeneInGraph(vm, gene);
            }
        };

        vm.closeEdgeInspector = function() {
            vm.selectedEdge = {};
        };

        vm.changeDisplay = function() {
            if (vm.display == vm.displayModes.graph) {
                vm.display = vm.displayModes.table;
            } else {
                vm.display = vm.displayModes.graph;
            }
        };

        vm.addGeneOfInterest = function(gene) {
            if (gene != null) {
                if (vm.genesOfInterest.indexOf(gene) < 0 && vm.allowAdditionalGenes == true) {
                    vm.genesOfInterest.push(gene);
                    vm.allowAdditionalGenes = false;
                }
            }
        };

        vm.resetAllData = function() {
            vm.neighbours = null;
        };

        vm.clearLocatedGene = function() {
            vm.resetInputFieldsLocal('geneLocator');
            GraphConfigService.clearLocatedGene(vm);
        }

        vm.getConfigForSelectedNeighbours = function() {
            var level = vm.genesOfInterest.length;
            $rootScope.state = $rootScope.states.loadingGraph;
            vm.showGraphSummary = false;
            vm.resetDisplayedData();
            RESTService.post('neighbour-general', {
                layout: vm.selectedLayout,
                selectedGenes: vm.genesOfInterest,
                fileName: vm.sharedData.correlationFileActual
            }).then(function(data) {
                console.log(data);

                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                if (vm.display == vm.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.applyConfig(data.config, "cyNeighbour" + vm.graphType, vm);
                vm.selfLoops = data.selfLoops;
                vm.edgeDictionary = data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                vm.explorerGenes = BasicDataService.loadExplorerDropdownOptions(vm, vm.genesOfInterest);
                vm.allVisibleGenes = vm.getAllVisibleGenes(vm);
                $rootScope.state = $rootScope.states.showingGraph;

                vm.setNeighboursGeneral(vm, level, true);
                vm.allowAdditionalGenes = true;

                vm.showGraphSummary = true;
            });
        };

        vm.neighbourConfigs = GraphConfigService.neighbourConfigs;

        vm.removeGene = function(gene) {
            vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
            if (vm.genesOfInterest.length == 0) {
                if (vm.cy) {
                    vm.cy.destroy();
                }
                vm.cy = null;
            } else {
                vm.getConfigForSelectedNeighbours();
            }

            vm.allowAdditionalGenes = true;
            vm.resetDisplayedData();
        };

        vm.removeAllGenes = function() {
            vm.allowAdditionalGenes = true;
            vm.genesOfInterest = [];
            if (vm.cy) {
                vm.cy.destroy();
            }
            vm.cy = null;
            vm.resetDisplayedData();
        };

        vm.getInteractionViaDictionary = function(source, target) {
            if (vm.edgeDictionary[source] != null && vm.edgeDictionary[source][target] != null) {
                return vm.edgeDictionary[source][target];
            } else if (vm.edgeDictionary[target] != null && vm.edgeDictionary[target][source] != null) {
                return vm.edgeDictionary[target][source];
            } else {
                return 0;
            }
        };

        vm.resetDisplayedData = function() {
            vm.closeEdgeInspector();
            vm.allVisibleGenes = [];
            vm.explorerGenes = [];
            vm.selfLoops = [];
            vm.neighbours = [];
            vm.resetInputFieldsLocal('');
            vm.clearLocatedGene();
            vm.showGraphSummary = false;
        };

        vm.getAllVisibleGenes = GraphConfigService.getAllVisibleGenes;
        vm.findGeneInGraph = GraphConfigService.findGeneInGraph;

        $rootScope.$watch(function() {
            return vm.sharedData.correlationFileActual;
        }, function() {
            vm.genesOfInterest = [];
            vm.resetDisplayedData();
            if (vm.cy) {
                vm.cy.destroy();
            }
            vm.cy = null;
        });

        $scope.$watch(function() {
            return vm.display;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph) {
                $timeout(function() {
                    if (vm.config != null && vm.cy != null) {
                        vm.cy.resize();
                        vm.needsRedraw = false;
                        vm.applyConfig(vm.config, "cyNeighbour" + vm.graphType, vm);
                    }
                }, 250);

            }
        });
    }
]);
