var myModule = angular.module("myApp.services");
myModule.factory('InitializationService', function($http, $timeout, Upload, BasicDataService, GraphConfigService, SharedService) {
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

        vm.layouts = angular.copy(BasicDataService.layouts);
        vm.displayModes = angular.copy(BasicDataService.displayModes);

        vm.minDegree = {
            first: 0,
            second: 0
        };

        vm.totalInteractions = null;

        vm.display = vm.displayModes.graph;
        vm.switchModel = false;

        vm.selectedLayout = vm.layouts.main[0].value;

        vm.sliderMinWeightNegative = -1;
        vm.sliderMaxWeightPositive = 1;

        vm.correlationFilterModel = {
            min: -1,
            max: 1,
            negativeFilter: 0,
            positiveFilter: 0,
            negativeEnabled: false,
            positiveEnabled: false
        };

        vm.resetInputFieldsGlobal = function() {
            angular.forEach(angular.element("md-autocomplete." + vm.graphType + " input"), function(value, key) {
                var a = angular.element(value);
                a.val('');
            });

            angular.forEach(angular.element("md-autocomplete." + vm.graphType + " button"), function(value, key) {
                $timeout(function() {
                    var a = angular.element(value);
                    a.click();
                    console.log("clicked");
                });
            });
        };

        vm.resetInputFieldsLocal = function(extraClass) {
            angular.forEach(angular.element("md-autocomplete." + vm.graphType + vm.ctrl + extraClass + " input"), function(value, key) {
                var a = angular.element(value);
                a.val('');
                if (document.activeElement != null) {
                    document.activeElement.blur();
                }
            });

            angular.forEach(angular.element("md-autocomplete." + vm.graphType + vm.ctrl + extraClass + " button"), function(value, key) {
                $timeout(function() {
                    var a = angular.element(value);
                    a.click();
                    if (document.activeElement != null) {
                        document.activeElement.blur();
                    }
                });
            });

            if (document.activeElement != null) {
                document.activeElement.blur();
            }
        };

        vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
        vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);

        vm.negativeFilterEnabled = false;
        vm.positiveFilterEnabled = false;

        vm.findGeneInGraph = GraphConfigService.findGeneInGraph;
        vm.getInteractingNodes = GraphConfigService.getInteractingNodes;
        vm.applyConfig = GraphConfigService.applyConfig;

        vm.getNodesWithMinDegree = BasicDataService.getNodesWithMinDegree;
        vm.loadDropdownOptions = BasicDataService.loadDropdownOptions;
        vm.loadGeneListDropdownOptions = BasicDataService.loadGeneListDropdownOptions;
        vm.loadNeighbourDropdownOptions = BasicDataService.loadNeighbourDropdownOptions;
        vm.querySearch = BasicDataService.querySearch;
        vm.setNeighboursGeneral = BasicDataService.setNeighboursGeneral;

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

        vm.firstNeighbourInteractions = [];
        vm.secondNeighbourInteractions = [];

        vm.firstNeighbours = {
            epi: [],
            stroma: []
        };

        vm.secondNeighbours = {
            epi: [],
            stroma: []
        };

        vm.resize = GraphConfigService.resetZoom;
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
