'use strict';

angular.module('myApp.controllers').controller('InteractionExplorerController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'ControlsService', 'InitializationService', 'ValidationService', 'ExportService', 'SharedService', 'TableService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, ControlsService, InitializationService, ValidationService, ExportService, SharedService, TableService,
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
        vm.resize = GraphConfigService.resetZoom;

        vm.exportNeighboursToCSV = ExportService.exportNeighboursToCSV;
        vm.exportGraphToPNG = ExportService.exportGraphToPNG;

        vm.sharedData = SharedService.data.nonDelta;

        vm.allowAdditionalGenes = true;
        vm.showGraphSummary = false;

        vm.resetInputFieldsGlobal = ControlsService.resetInputFieldsGlobal;
        vm.resetInputFieldsLocal = ControlsService.resetInputFieldsLocal;

        vm.getInteractionViaDictionary = TableService.getInteractionViaDictionary;
        vm.setNeighboursGeneral = TableService.setNeighboursGeneral;

        vm.getNodesWithMinDegree = ControlsService.getNodesWithMinDegree;
        vm.loadDropdownOptions = ControlsService.loadDropdownOptions;
        vm.loadGeneListDropdownOptions = ControlsService.loadGeneListDropdownOptions;
        vm.loadNeighbourDropdownOptions = ControlsService.loadNeighbourDropdownOptions;
        vm.querySearch = ControlsService.querySearch;
        vm.getAllVisibleGenes = ControlsService.getAllVisibleGenes;
        vm.closeEdgeInspector = ControlsService.closeEdgeInspector;
        vm.changeDisplay = ControlsService.changeDisplay;

        vm.locateGene = GraphConfigService.locateGene;


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
            vm.resetInputFieldsLocal(vm, 'geneLocator');
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
                vm.applyConfig(vm, data.config, "cyNeighbour" + vm.graphType);
                vm.selfLoops = data.selfLoops;
                vm.edgeDictionary = data.edgeDictionary;

                // Only use the following method if the final selected node does not generate any new nodes. 
                // Even if it does we might end up having issue though
                vm.explorerGenes = ControlsService.loadExplorerDropdownOptions(vm, vm.genesOfInterest);
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
                GraphConfigService.destroyGraph(vm);
            } else {
                vm.getConfigForSelectedNeighbours();
            }

            vm.allowAdditionalGenes = true;
            vm.resetDisplayedData();
        };

        vm.removeAllGenes = function() {
            vm.allowAdditionalGenes = true;
            vm.genesOfInterest = [];
            GraphConfigService.destroyGraph(vm);
            vm.resetDisplayedData();
        };

        vm.resetDisplayedData = function() {
            vm.closeEdgeInspector(vm);
            vm.allVisibleGenes = [];
            vm.explorerGenes = [];
            vm.selfLoops = [];
            vm.neighbours = [];
            vm.resetInputFieldsLocal(vm, '');
            vm.clearLocatedGene();
            vm.showGraphSummary = false;
        };

        $rootScope.$watch(function() {
            return vm.sharedData.correlationFileActual;
        }, function() {
            vm.genesOfInterest = [];
            vm.resetDisplayedData();
            GraphConfigService.destroyGraph(vm);
        });

        $scope.$watch(function() {
            return vm.display;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph) {
                $timeout(function() {
                    if (vm.config != null && vm.cy != null) {
                        vm.cy.resize(vm);
                        vm.needsRedraw = false;
                        vm.applyConfig(vm, vm.config, "cyNeighbour" + vm.graphType);
                    }
                }, 250);

            }
        });
    }
]);
