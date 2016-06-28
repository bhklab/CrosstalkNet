var myModule = angular.module("myApp.services");
myModule.factory('InitializationService', function($http, $timeout, Upload, GraphConfigService, SharedService) {
    var service = {};

    service.initializeCommonVariables = initializeCommonVariables;
    service.initializeSharedMethods = initializeSharedMethods;

    function initializeSharedMethods(vm) {
        for (var prop in SharedService.methods) {
            vm[prop] = SharedService.methods[prop];
        }
    }

    function initializeCommonVariables(vm) {
        vm.selectedItemFirst = null;
        vm.selectedGOI = null;
        vm.zoomGene = null;
        vm.searchTextGOI = "";
        vm.searchTextFirst = "";
        vm.searchTextSecond = "";
        vm.searchTextZoom = "";
        vm.minPositiveWeight = 0;
        vm.minNegativeWeight = 0;

        vm.minDegree = {
            first: 0,
            second: 0
        };

        vm.totalInteractions = null;

        vm.display = vm.displayModes.graph;
        vm.switchModel = false;

        vm.selectedLayout = vm.layouts.main[0].value;

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

        vm.findGeneInGraph = GraphConfigService.findGeneInGraph;
        vm.getInteractingNodes = GraphConfigService.getInteractingNodes;
        vm.applyConfig = GraphConfigService.applyConfig;

        vm.genesOfInterest = [];
        vm.edges = 0;
        vm.nodes = 0;
        vm.displaySecondNeighbours = true;

        vm.GOIStates = {
            initial: 0,
            filterFirst: 1,
            getSecondNeighbours: 2,
            filterSecond: 3
        };

        vm.GOIState = vm.GOIStates.initial;

        vm.exportTableToCSV = function(tableID) {
            $("." + tableID).tableToCSV();
        };

        vm.edgeDictionary = {};
        vm.selfLoops = [];
        vm.allVisibleGenes = [];

        vm.query = {
            limit: 5,
            page: 1
        };
    }

    return service;
});
