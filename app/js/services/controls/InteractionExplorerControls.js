var myModule = angular.module("myApp.services");
myModule.factory('InteractionExplorerControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService, GlobalControls) {
    var service = {};

    service.layouts = [{ display: "Bipartite", value: "preset" }, { display: "Random", value: "random" }];
    service.setMethods = setMethods;

    function setMethods(vm) {
        vm.addGeneOfInterest = function(gene) {
            if (gene != null) {
                if (vm.genesOfInterest.indexOf(gene) < 0 && vm.allowAdditionalGenes == true) {
                    vm.genesOfInterest.push(gene);
                    vm.allowAdditionalGenes = false;
                }
            }
        };

        vm.removeGene = function(gene) {
            vm.genesOfInterest.splice(vm.genesOfInterest.indexOf(gene), 1);
            if (vm.genesOfInterest.length == 0) {
                GraphConfigService.destroyGraph(vm);
            } else {
                vm.refreshGraph();
            }

            vm.allowAdditionalGenes = true;
            vm.resetDisplayedData();
        };

        vm.removeAllGenes = function() {
            vm.allowAdditionalGenes = true;
            vm.genesOfInterest = [];
            GraphConfigService.destroyGraph(vm);
            vm.resetDisplayedData();
        };

        vm.resetDisplayedData = function() {
            vm.allVisibleGenes = [];
            vm.explorerGenes = [];
            GlobalControls.resetInputFieldsLocal(vm, '');
            vm.clearLocatedGene();
        };

        vm.loadExplorerDropdownOptions = function(selectedGenes) {
            var genes = [];

            if (vm.sdWithinTab.cy == null || selectedGenes == null) {
                return [];
            }

            vm.sdWithinTab.cy.edges("[source='" + selectedGenes[selectedGenes.length - 1].value + "']").forEach(function(
                edge) {
                genes.push(edge.target().data());
            });

            return genes.map(function(gene) {
                return {
                    value: gene.id,
                    display: gene.id + ' ' + gene.degree,
                    object: gene
                };
            });
        };
    };

    return service;
});
