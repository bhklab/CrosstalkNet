var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService, ValidationService) {
    var service = {};
    var networkTypes = { normal: 'normal', tumor: 'tumor', delta: 'delta' };
    var correlationFileModel = { normal: null, tumor: null, delta: null };
    var dataModel = {
        reloadFileList: false,
        correlationFileActual: angular.copy(correlationFileModel),
        geneList: null,
        matrixSummary: null,
        selectedNetworkType: networkTypes.tumor,
        clearAllData: false,
        networkTypes: networkTypes,
        guest: false
    };

    service.data = { global: angular.copy(dataModel) };

    service.states = {
        initial: { id: 0, text: "Waiting for user to query..." },
        showingGraph: { id: 1, text: "Graph finished" },
        finishedGettingAllPaths: { id: 2, text: "All paths have been obtained" },
        finishedUploadingFile: { id: 3, text: "Successfully uploaded file to server" },
        failedUploadingFile: { id: 4, text: "Failed to upload file to server" },
        loadingGraph: { id: 5, text: "Getting graph from server..." },
        loadingConfig: { id: 6, text: "Initializing graph..." },
        gettingGeneList: { id: 7, text: "Getting gene list..." },
        gettingAllPaths: { id: 8, text: "Getting all paths between source and target genes..." },
        uploadingFile: { id: 9, text: "Uploading file to server..." }
    };

    $rootScope.states = angular.copy(service.states);
    $rootScope.state = service.states.initial;

    var withinTabModel = {
        cy: null,
        display: null,
        neighbours: null,
        selectedLayout: null,
        graphSummary: null,
        selfLoops: null,
        selectedTab: 0,
        showGraphSummary: false,
        selectedEdge: null,
        selfLoopSearch: ""
    };

    var tableOrderModel = { weight: "'firstEdge.weight'", normal: "'firstEdge.normal'", tumor: "'firstEdge.tumor'" };
    var withinTabModelPE = { pathSourceCached: null, pathTargetCached: null, allPaths: null, display: null, types: null, tableOrder: angular.copy(tableOrderModel) };

    service.data.main = angular.copy(withinTabModel);
    service.data.interactionExplorer = angular.copy(withinTabModel);
    service.data.pathExistence = angular.copy(withinTabModelPE);
    service.resetWTM = resetWTM;
    service.resetWTMPE = resetWTMPE;
    service.resetCorrelationFiles = resetCorrelationFiles;
    service.resetMatrixSummary = resetMatrixSummary;

    function resetWTM(vm) {
        for (var prop in withinTabModel) {
            if (prop != "display" && prop != "selectedTab" && prop != "selectedLayout") {
                vm.sdWithinTab[prop] = withinTabModel[prop];
            }
        }
    }

    function resetWTMPE(vm) {
        for (var prop in withinTabModelPE) {
            if (prop == "tableOrder") {
                vm.sdWithinTab[prop] = angular.copy(tableOrderModel);
            } else if (prop != "display") {
                vm.sdWithinTab[prop] = withinTabModel[prop];
            }
        }
    }

    function resetCorrelationFiles() {
        service.data.global.correlationFileActual = angular.copy(correlationFileModel);
    }

    function resetMatrixSummary() {
        service.data.global.matrixSummary = null;
    }

    return service;
});
