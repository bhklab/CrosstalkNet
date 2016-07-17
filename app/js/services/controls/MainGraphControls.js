var myModule = angular.module("myApp.services");
myModule.factory('MainGraphControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService, GlobalControls) {
    var service = {};

    service.layouts = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Random", value: "random" }];

    service.setMethods = setMethods;

    function setMethods(vm) {
        vm.addGeneOfInterest = function(gene) {
            if (gene != null) {
                if (vm.genesOfInterest.indexOf(gene) < 0) {
                    vm.genesOfInterest.push(gene);
                }

                GlobalControls.resetInputFieldsLocal(vm, 'gene-input');
                GlobalControls.focusElement("md-autocomplete." + vm.ctrl + "gene-input" + " input");
            }
        };

        vm.getNodesWithMinDegree = function() {
            var nodes = vm.sdWithinTab.cy.nodes();
            var result = [];

            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].data('degree') > vm.minDegree.first) {
                    result.push(nodes[i]);
                }
            }

            return result;
        };

        vm.advanceGOIState = function(data, depth) {
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
        };

        vm.resetGeneSelection = function() {
            vm.GOIState = vm.GOIStates.initial;
            vm.resetFilters();
        };

        vm.resetFilters = function() {
            vm.correlationFilterFirst = angular.copy(vm.correlationFilterModel);
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };

        vm.removeGene = function(gene) {
            if (vm.genesOfInterest.length == 1) {
                vm.removeGenesOfInterest();
            } else {
                vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
                vm.refreshGraph();
            }
        };

        vm.removeGenesOfInterest = function() {
            vm.GOIState = vm.GOIStates.initial;
            vm.genesOfInterest = [];
            vm.allVisibleGenes = [];
            GraphConfigService.destroyGraph(vm);
            GlobalControls.resetInputFieldsLocal(vm, '');
            GlobalControls.closeEdgeInspector(vm);
            vm.clearLocatedGene();
            vm.resetFilters();
            SharedService.resetWTM(vm);
        };

        vm.returnToFirstNeighboursFilter = function() {
            vm.GOIState = vm.GOIStates.filterFirst;
            vm.correlationFilterSecond = angular.copy(vm.correlationFilterModel);
        };
    }

    return service;
});
