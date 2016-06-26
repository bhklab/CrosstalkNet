var myModule = angular.module("myApp.services");
myModule.factory('TableService', function($http, $rootScope) {
    var service = {};

    service.getInteractionViaDictionary = getInteractionViaDictionary;
    service.setNeighboursGeneral = setNeighboursGeneral;
    service.getNeighboursFromEdges = getNeighboursFromEdges;

    function getInteractionViaDictionary(vm, source, target) {
        if (vm.edgeDictionary[source] != null && vm.edgeDictionary[source][target] != null) {
            return vm.edgeDictionary[source][target];
        } else if (vm.edgeDictionary[target] != null && vm.edgeDictionary[target][source] != null) {
            return vm.edgeDictionary[target][source];
        } else {
            return 0;
        }
    }

    function setNeighboursGeneral(scope, highestLevel, isExplorer) {
        var neighbours = [];

        for (var i = 1; i <= highestLevel; i++) {
            var temp = getNeighboursFromEdges(scope, i);

            neighbours.push(temp);
        }

        scope.neighbours = neighbours;
    }

    function getNeighboursFromEdges(scope, level) {
        var neighbours = { epi: new Set(), stroma: new Set() };
        var edges = scope.cy.filter(function(i, element) {
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
