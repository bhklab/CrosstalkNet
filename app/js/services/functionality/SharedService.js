var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService) {
    var service = {};
    var networkTypes = { normal: 'normal', tumor: 'tumor', delta: 'delta' };
    var correlationFileModel = { normal: null, tumor: null, delta: null };
    var dataModel = { reloadFileList: false, correlationFileActual: angular.copy(correlationFileModel), geneList: null, matrixSummary: null, selectedNetworkType: networkTypes.normal, clearAllData: false, networkTypes: networkTypes};

    service.data = {global: angular.copy(dataModel)};

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

    var tableOrderModel = {weight: null, normal: null, tumor: null};
    var withinTabModelPE = { pathSourceCached: null, pathTargetCached: null, allPaths: null, display: null, types: null, tableOrder: angular.copy(tableOrderModel)};

    service.data.main = angular.copy(withinTabModel);
    service.data.interactionExplorer = angular.copy(withinTabModel);
    service.data.pathExistence = angular.copy(withinTabModelPE);
    service.resetWTM = resetWTM;
    service.resetWTMPE = resetWTMPE;
    service.resetCorrelationFiles = resetCorrelationFiles;

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
            }
            else if (prop != "display") {
                vm.sdWithinTab[prop] = withinTabModel[prop];
            }
        }
    }

    function resetCorrelationFiles() {
        service.data.global.correlationFileActual = angular.copy(correlationFileModel);
    }

    return service;
});
