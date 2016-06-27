var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService) {
    var service = {};
    var dataModel = { reloadFileList: false, correlationFileActual: null, geneList: null, matrixSummary: null };

    service.data = { delta: {}, nonDelta: {} };
    service.data.delta = angular.copy(dataModel);
    service.data.nonDelta = angular.copy(dataModel);

    service.data.main = {
        cy: null,
        display: null,
        neighbours: null,
        selectedLayout: null,
        graphSummary: null,
        selfLoops: null,
        selectedTab: 0,
        showGraphSummary: false
    };
    service.data.interaction = {
        cy: null,
        display: null,
        neighbours: null,
        selectedLayout: null,
        graphSummary: null,
        selfLoops: null,
        selectedTab: 0,
        showGraphSummary: false
    };

    service.methods = { main: {}, neighbour: {}, path: {}, global: {} };

    return service;
});
