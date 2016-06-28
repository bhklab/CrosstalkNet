var myModule = angular.module("myApp.services");
myModule.factory('PathExistenceControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService, GlobalControls) {
    var service = {};

    service.setMethods = setMethods;

    function setMethods(vm) {
        vm.setPathExplorerGene = function(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    vm.pathExplorerSource = gene;
                } else {
                    vm.pathExplorerTarget = gene;
                }
            }
        };
    };

    return service;
});
