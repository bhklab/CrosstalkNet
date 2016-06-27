var myModule = angular.module("myApp.services");
myModule.factory('TableService', function($http, $rootScope) {
    var service = {};

    service.getInteractionViaDictionary = getInteractionViaDictionary;
    service.getNeighboursGeneral = getNeighboursGeneral;
    service.getNeighboursFromEdges = getNeighboursFromEdges;

    function getInteractionViaDictionary(vm, source, target) {
        if (vm.sdWithinTab.edgeDictionary[source] != null && vm.sdWithinTab.edgeDictionary[source][target] != null) {
            return vm.sdWithinTab.edgeDictionary[source][target];
        } else if (vm.sdWithinTab.edgeDictionary[target] != null && vm.sdWithinTab.edgeDictionary[target][source] != null) {
            return vm.sdWithinTab.edgeDictionary[target][source];
        } else {
            return 0;
        }
    }

    function getNeighboursGeneral(vm, highestLevel, isExplorer) {
        var neighbours = [];

        for (var i = 1; i <= highestLevel; i++) {
            var temp = getNeighboursFromEdges(vm, i);

            neighbours.push(temp);
        }

        return neighbours;
    }

    function getNeighboursFromEdges(vm, level) {
        var neighbours = { epi: new Set(), stroma: new Set() };
        var edges = vm.sdWithinTab.cy.filter(function(i, element) {
            if (element.isEdge() && element.data('neighbourLevel') == level) {
                return true;
            }

            return false;
        });

        for (var i = 0; i < edges.length; i++) {
            if (edges[i].data('source').endsWith("-E")) {
                neighbours.epi.add(edges[i].data('source'));
                neighbours.stroma.add(edges[i].data('target'));
            } else {
                neighbours.epi.add(edges[i].data('target'));
                neighbours.stroma.add(edges[i].data('source'));
            }
        }

        neighbours.epi = Array.from(neighbours.epi);
        neighbours.stroma = Array.from(neighbours.stroma);

        return neighbours;
    }

    return service;
});
