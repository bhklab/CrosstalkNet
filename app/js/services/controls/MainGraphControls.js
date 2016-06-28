var myModule = angular.module("myApp.services");
myModule.factory('MainGraphControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService, GlobalControls) {
    var service = {};

    service.layouts = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Random", value: "random" }];

    service.getNodesWithMinDegree = getNodesWithMinDegree;
    service.resetFilters = resetFilters;
    service.resetGeneSelection = resetGeneSelection;
    service.removeGenesOfInterest = removeGenesOfInterest;
    service.removeGene = removeGene;
    service.addGeneOfInterest = addGeneOfInterest;

    function addGeneOfInterest(vm, gene) {
        if (gene != null) {
            if (vm.genesOfInterest.indexOf(gene) < 0) {
                vm.genesOfInterest.push(gene);
            }
        }
    }

    function getNodesWithMinDegree(scope) {
        var nodes = scope.cy.nodes();
        var result = [];

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].data('degree') > scope.minDegree.first) {
                result.push(nodes[i]);
            }
        }

        return result;
    }

    function resetGeneSelection(vm) {
        vm.GOIState = vm.GOIStates.initial;
        resetFilters(vm);
    }

    function resetFilters(vm) {
        vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
        vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
    }

    function removeGene(vm, gene) {
        if (vm.genesOfInterest.length == 1) {
            removeGenesOfInterest(vm);
        } else {
            vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
        }
    }

    function removeGenesOfInterest(vm) {
        vm.genesOfInterest = [];
        vm.allVisibleGenes = [];
        GraphConfigService.destroyGraph(vm);
        GlobalControls.resetInputFieldsLocal(vm, '');
        GlobalControls.closeEdgeInspector(vm);
        resetFilters(vm);
        SharedService.resetWTM(vm);
    }

    return service;
});
