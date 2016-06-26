var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService, RESTService, ValidationService) {
    var service = {};
    var dataModel = { reloadFileList: false, correlationFileActual: null, geneList: null };

    service.data = { delta: {}, nonDelta: {} };
    service.data.delta = angular.copy(dataModel);
    service.data.nonDelta = angular.copy(dataModel);

    service.methods = { main: {}, neighbour: {}, path: {}, global: {} };

    service.methods.main.clearLocatedGene = clearLocatedGene;
    service.methods.main.getGeneList = getGeneList;
    service.methods.main.getFileList = getFileList;

    function clearLocatedGene(vm) {
        vm.resetInputFieldsLocal(vm, 'geneLocator');
        GraphConfigService.clearLocatedGene(vm);
    }

    function getGeneList(vm) {
        $rootScope.state = $rootScope.states.gettingGeneList;
        RESTService.post('gene-list', { fileName: vm.sharedData.correlationFileActual })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                vm.sharedData.geneList = data.geneList;
                $rootScope.state = $rootScope.states.initial;
            });
    }

    function getFileList(vm, types) {
        RESTService.post('available-matrices', { types: types })
            .then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    return;
                }

                vm.fileList = data.fileList;
            });
    }

    return service;
});
