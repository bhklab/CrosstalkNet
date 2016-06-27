var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService) {
    var service = {};
    var dataModel = { reloadFileList: false, correlationFileActual: null, geneList: null, matrixSummary: null };

    service.data = { delta: {}, nonDelta: {} };
    service.data.delta = angular.copy(dataModel);
    service.data.nonDelta = angular.copy(dataModel);

    var withinTabModel = {
        cy: null,
        display: null,
        neighbours: null,
        selectedLayout: null,
        graphSummary: null,
        selfLoops: null,
        selectedTab: 0,
        showGraphSummary: false
    };

    service.data.main = angular.copy(withinTabModel);
    service.data.interaction = angular.copy(withinTabModel);

    service.resetWTM = resetWTM;

    function resetWTM(vm) {
        for (var prop in withinTabModel) {
            if (prop != "display") {
                vm.sdWithinTab[prop] = withinTabModel[prop];
            }
        }
    }


    return service;
});
