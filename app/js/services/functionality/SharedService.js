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
        loadingGraph: { id: 1, text: "Getting graph from server..." },
        loadingConfig: { id: 2, text: "Initializing graph..." },
        showingGraph: { id: 3, text: "Graph finished" },
        gettingGeneList: { id: 4, text: "Getting gene list..." },
        gettingAllPaths: { id: 5, text: "Getting all paths between source and target genes..." },
        finishedGettingAllPaths: { id: 6, text: "All paths have been obtained" },
        uploadingFile: { id: 7, text: "Uploading file to server..." },
        finishedUploadingFile: { id: 8, text: "Successfully uploaded file to server" },
        failedUploadingFile: { id: 9, text: "Failed to upload file to server" },
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

    var tableOrderModel = { weight: null, normal: null, tumor: null };
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
