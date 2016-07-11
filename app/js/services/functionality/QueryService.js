var myModule = angular.module("myApp.services");
myModule.factory('QueryService', function($q, $http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService, GlobalControls, TableService) {
    var service = {};

    service.getGeneList = getGeneList;
    service.getFileList = getFileList;
    service.getMatrixSummary = getMatrixSummary;
    service.getRelevantGenes = getRelevantGenes;
    service.getInteractionExplorerConfig = getInteractionExplorerConfig;
    service.getAllPaths = getAllPaths;

    function getGeneList(file) {
        $rootScope.state = $rootScope.states.gettingGeneList;
        var deferred = $q.defer();

        RESTService.post('gene-list', { selectedFile: file })
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

    function getMatrixSummary(file) {
        var deferred = $q.defer();

        RESTService.post('overall-matrix-stats', { selectedFile: file }).then(function(data) {
            if (!ValidationService.checkServerResponse(data)) {
                deferred.resolve({ matrixSummary: null });
            }

            deferred.resolve({ matrixSummary: data.overallMatrixStats });
        });
        return deferred.promise;
    }

    function getRelevantGenes(vm, filter) {
        var deferred = $q.defer();
        var filterFirst = false;
        var filterSecond = false;
        var depth = 1;
        $rootScope.state = $rootScope.states.loadingGraph;

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

        RESTService.post("delta-submatrix", {
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
                selectedFile: vm.sharedData.correlationFileActual,
                selectedNetworkType: vm.sharedData.selectedNetworkType
            })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ data: null });
                }

                deferred.resolve({ data: data, depth: depth });
            });

        return deferred.promise;
    }

    function getInteractionExplorerConfig(vm) {
        var deferred = $q.defer();
        var level = vm.genesOfInterest.length;
        $rootScope.state = $rootScope.states.loadingGraph;
        RESTService.post('delta-interaction-explorer', {
            layout: vm.sdWithinTab.selectedLayout,
            selectedGenes: vm.genesOfInterest,
            selectedFile: vm.sharedData.correlationFileActual,
            selectedNetworkType: vm.sharedData.selectedNetworkType
        }).then(function(data) {
            if (!ValidationService.checkServerResponse(data)) {
                deferred.resolve({ data: null });
            }

            deferred.resolve({ data: data, level: level });
        });

        return deferred.promise;
    }

    function getAllPaths(vm) {
        var deferred = $q.defer();

        $rootScope.state = $rootScope.states.gettingAllPaths;

        RESTService.post('delta-get-all-paths', {
            target: vm.pathExplorerTarget.value,
            source: vm.pathExplorerSource.value,
            selectedFile: vm.sharedData.correlationFileActual, 
            selectedNetworkType: vm.sharedData.selectedNetworkType
        }).then(function(data) {
            if (!ValidationService.checkServerResponse(data)) {
                deferred.resolve({ allPaths: null });
            }

            deferred.resolve({ allPaths: data.paths, types: data.types});
        });

        return deferred.promise;
    }

    return service;
});
