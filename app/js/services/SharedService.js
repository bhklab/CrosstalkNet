var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope, GraphConfigService) {
    var service = {};
    var dataModel = { reloadFileList: false, correlationFileActual: null, geneList: null };

    service.data = { delta: {}, nonDelta: {} };
    service.data.delta = angular.copy(dataModel);
    service.data.nonDelta = angular.copy(dataModel);

    service.methods = {};

    service.methods.changeDisplay = changeDisplay;
    service.methods.addGeneOfInterest = addGeneOfInterest;
    service.methods.locateGene = locateGene;
    service.methods.closeEdgeInspector = closeEdgeInspector;
    service.methods.clearLocatedGene = clearLocatedGene;

    function changeDisplay(scope) {
        if (scope.display == scope.displayModes.graph) {
            scope.display = scope.displayModes.table;
        } else {
            scope.display = scope.displayModes.graph;
        }
    };

    function addGeneOfInterest(scope, gene) {
        if (gene != null) {
            if (scope.genesOfInterest.indexOf(gene) < 0) {
                scope.genesOfInterest.push(gene);
            }
        }
    };

    function locateGene(scope, gene) {
        if (gene != null && gene != '') {
            scope.findGeneInGraph(scope, gene);
        }
    };

    function closeEdgeInspector(scope) {
        scope.selectedEdge = {};
    };

    function clearLocatedGene(scope) {
        scope.resetInputFieldsLocal('geneLocator');
        GraphConfigService.clearLocatedGene(scope);
    };

    return service;
});
