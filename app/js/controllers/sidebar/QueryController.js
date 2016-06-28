'use strict';

angular.module('myApp.controllers').controller('QueryController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'GlobalControls', 'MainGraphControls', 'InitializationService', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, MainGraphControls, InitializationService, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initialize = function(ctrl, type) {
            vm.ctrl = ctrl;
            vm.graphType = type;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            intializeVariables();
        };

        vm.sharedData = SharedService.data.nonDelta;

        function intializeVariables() {
            vm.selectedItemFirst = null;
            vm.selectedGOI = null;
            vm.zoomGene = null;
            vm.searchTextGOI = "";
            vm.searchTextFirst = "";
            vm.searchTextSecond = "";
            vm.searchTextZoom = "";

            vm.minDegree = {
                first: 0,
                second: 0
            };

            vm.correlationFilterModel = {
                min: -1,
                max: 1,
                negativeFilter: 0,
                positiveFilter: 0,
                negativeEnabled: false,
                positiveEnabled: false
            };

            vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);

            vm.displayModes = angular.copy(GlobalControls.displayModes);

            vm.genesOfInterest = [];

            vm.GOIStates = {
                initial: 0,
                filterFirst: 1,
                getSecondNeighbours: 2,
                filterSecond: 3
            };

            vm.GOIState = vm.GOIStates.initial;

            vm.edgeDictionary = {};
            vm.selfLoops = [];
            vm.allVisibleGenes = [];

            vm.query = {
                limit: 5,
                page: 1
            };

            vm.sdWithinTab.showGraphSummary = false;
        }

        vm.getRelevantGenes = QueryService.getRelevantGenes;

        vm.addGeneOfInterest = MainGraphControls.addGeneOfInterest;
        vm.removeGene = MainGraphControls.removeGene;
        vm.removeGenesOfInterest = MainGraphControls.removeGenesOfInterest;
        vm.resetFilters = MainGraphControls.resetFilters;
        vm.getNodesWithMinDegree = MainGraphControls.getNodesWithMinDegree;
        vm.resetGeneSelection = MainGraphControls.resetGeneSelection;

        vm.resetInputFieldsGlobal = GlobalControls.resetInputFieldsGlobal;
        vm.resetInputFieldsLocal = GlobalControls.resetInputFieldsLocal;
        vm.querySearch = GlobalControls.querySearch;
        vm.getAllVisibleGenes = GlobalControls.getAllVisibleGenes;
        
        vm.resize = GraphConfigService.resetZoom;
        vm.locateGene = GraphConfigService.locateGene;

        vm.clearLocatedGene = function() {
            vm.resetInputFieldsLocal(vm, 'geneLocator');
            GraphConfigService.clearLocatedGene(vm);
        };

        vm.refreshGraph = function() {
            vm.getRelevantGenes(vm, true);
        };

        vm.returnToFirstNeighboursFilter = function() {
            vm.GOIState = vm.GOIStates.filterFirst;
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };

        $scope.$watch(function() {
            if (vm.sdWithinTab && (vm.genesOfInterest != null && vm.genesOfInterest.length > 0) ||
                (vm.sdWithinTab != null && vm.sdWithinTab.selectedLayout != null && vm.GOIState != vm.GOIStates.initial)) {
                return vm.sdWithinTab.selectedLayout;
            }
            return null;
        }, function(newValue, oldValue) {
            if (newValue != null && oldValue != null && newValue != oldValue) {
                vm.refreshGraph();    
            }
        });

        $scope.$watch(function() {
            return vm.sharedData.correlationFileActual;
        }, function(newValue, oldValue) {
            if (newValue != "" && newValue != null && newValue != oldValue) {
                intializeVariables();
                GraphConfigService.destroyGraph(vm);
            }
        });

        $scope.$watch(function() {
            if (vm.sdWithinTab) {
                return vm.sdWithinTab.display;
            }
            return null;
        }, function(newValue, oldValue) {
            if (newValue == vm.displayModes.graph && newValue != oldValue) {
                $timeout(function() {
                    if (vm.sdWithinTab.config != null) {
                        vm.sdWithinTab.cy.resize();
                        vm.needsRedraw = false;
                        vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyMain" + vm.graphType);
                    }
                }, 250);
            }
        });
    }
]);
