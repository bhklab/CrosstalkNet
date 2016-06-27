var myModule = angular.module("myApp.services");
myModule.factory('QueryService', function($q, $http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService, ControlsService, TableService) {
    var service = {};

    service.getGeneList = getGeneList;
    service.getFileList = getFileList;
    service.getMatrixSummary = getMatrixSummary;
    service.getRelevantGenes = getRelevantGenes;

    function getGeneList(fileName) {
        $rootScope.state = $rootScope.states.gettingGeneList;
        var deferred = $q.defer();

        RESTService.post('gene-list', { fileName: fileName })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ geneList: null });
                }

                $rootScope.state = $rootScope.states.initial;
                deferred.resolve({ geneList: data.geneList });
            });
        return deferred.promise;
    }

    function getFileList(types) {
        var deferred = $q.defer();

        RESTService.post('available-matrices', { types: types })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ fileList: null });
                }

                deferred.resolve({ fileList: data.fileList });
            });
        return deferred.promise;
    }

    function getMatrixSummary(fileName) {
        var deferred = $q.defer();

        RESTService.post('overall-matrix-stats', { fileName: fileName }).then(function(data) {
            if (!ValidationService.checkServerResponse(data)) {
                deferred.resolve({ matrixSummary: null });
            }

            deferred.resolve({ matrixSummary: data.overallMatrixStats });
        });
        return deferred.promise;
    }

    function getRelevantGenes(vm, filter) {
        var filterFirst = false;
        var filterSecond = false;
        var depth = 1;
        $rootScope.state = $rootScope.states.loadingGraph;
        vm.sdWithinTab.showGraphSummary = false;

        if (vm.GOIState == vm.GOIStates.filterFirst) {
            if (filter == false) {
                depth = 2;
            }
            filter = true;
            filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
        } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
            filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
            filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
            depth = 2;
        } else if (vm.GOIState == vm.GOIStates.filterSecond) {
            filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
            filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
            depth = 2;
        }

        RESTService.post("submatrix", {
                selectedGenes: vm.genesOfInterest,
                minNegativeWeightFirst: vm.correlationFilterFirst.negativeFilter ==
                    null || !vm.correlationFilterFirst.negativeEnabled ?
                    "NA" : vm.correlationFilterFirst.negativeFilter,
                minPositiveWeightFirst: vm.correlationFilterFirst.positiveFilter ==
                    null || !vm.correlationFilterFirst.positiveEnabled ?
                    "NA" : vm.correlationFilterFirst.positiveFilter,
                minNegativeWeightSecond: vm.correlationFilterSecond.negativeFilter ==
                    null || !vm.correlationFilterSecond.negativeEnabled ?
                    "NA" : vm.correlationFilterSecond.negativeFilter,
                minPositiveWeightSecond: vm.correlationFilterSecond.positiveFilter ==
                    null || !vm.correlationFilterSecond.positiveEnabled ?
                    "NA" : vm.correlationFilterSecond.positiveFilter,
                selectedFilterFirst: { negative: vm.correlationFilterFirst.negativeEnabled, positive: vm.correlationFilterFirst.positiveEnabled },
                selectedFilterSecond: { negative: vm.correlationFilterSecond.negativeEnabled, positive: vm.correlationFilterSecond.positiveEnabled },
                filterFirst: filterFirst && filter,
                filterSecond: filterSecond && filter,
                layout: vm.sdWithinTab.selectedLayout,
                depth: depth,
                fileName: vm.sharedData.correlationFileActual
            })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                $rootScope.state = $rootScope.states.loadingConfig;
                vm.totalInteractions = data.totalInteractions;
                if (vm.sdWithinTab.display == ControlsService.displayModes.table) {
                    vm.needsRedraw = true;
                }
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, data.config, "cyMain" + vm.graphType);

                vm.sdWithinTab.edgeDictionary = data.edgeDictionary;
                vm.sdWithinTab.selfLoops = data.selfLoops;
                vm.allVisibleGenes = vm.getAllVisibleGenes(vm);
                vm.sdWithinTab.showGraphSummary = true;
                $rootScope.state = $rootScope.states.showingGraph;

                if (vm.GOIState == vm.GOIStates.initial) {
                    vm.correlationFilterFirst.min = data.minNegativeWeight;
                    vm.correlationFilterFirst.max = data.maxPositiveWeight;
                    vm.GOIState = vm.GOIStates.filterFirst;
                } else if (vm.GOIState == vm.GOIStates.filterFirst && depth == 2) {
                    vm.correlationFilterSecond.min = data.minNegativeWeight;
                    vm.correlationFilterSecond.max = data.maxPositiveWeight;
                    vm.GOIState = vm.GOIStates.getSecondNeighbours;
                } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
                    vm.GOIState = vm.GOIStates.filterSecond;
                }

                vm.sdWithinTab.neighbours = TableService.getNeighboursGeneral(vm, depth, false);
            });
    };

    return service;
});
