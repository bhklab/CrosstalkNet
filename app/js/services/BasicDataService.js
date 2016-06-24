var myModule = angular.module("myApp.services");
myModule.factory('BasicDataService', function($http, $rootScope) {
    var service = {};

    service.states = {
        initial: { id: 0, text: "Waiting for user to query..." },
        loadingGraph: { id: 1, text: "Getting graph from server..." },
        loadingConfig: { id: 2, text: "Initializing graph..." },
        showingGraph: { id: 3, text: "Graph finished" },
        gettingGeneList: { id: 4, text: "Getting gene list..." },
        gettingAllPaths: { id: 5, text: "Getting all paths between source and target genes..." },
        finishedGettingAllPaths: { id: 6, text: "All paths have been obtained" },
        uploadingFile: { id: 7, text: "Uploading file to server..." },
        finishedUploadingFile: { id: 8, text: "Successfully uploaded file to server" },
        failedUploadingFile: { id: 9, text: "Failed to upload file to server" },
    };

    service.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
        { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
    ];

    service.displayModes = {graph: 'Graph', table: 'Tables'};

    service.layouts = { main: null, interactionExplorer: null };
    service.layouts.main = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Random", value: "random" }];

    service.layouts.interactionExplorer = [{ display: "Bipartite", value: "preset" }, { display: "Random", value: "random" }];

    service.loadExplorerDropdownOptions = loadExplorerDropdownOptions;
    service.querySearch = querySearch;
    service.getNodesWithMinDegree = getNodesWithMinDegree;
    service.setNeighboursGeneral = setNeighboursGeneral;

    function loadExplorerDropdownOptions(scope, selectedGenes) {
        var genes = [];

        scope.cy.edges("[source='" + selectedGenes[selectedGenes.length - 1].value + "']").forEach(function(
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
    }

    function querySearch(query, source, scope) {
        var results = [];
        var deferred;

        if (source == "locate") {
            if (scope.allVisibleGenes != null) {
                results = query ? scope.allVisibleGenes.filter(createFilterFor(query)) :
                    scope.allVisibleGenes,
                    deferred;
            }
        } else if (source == "explorer") {
            if (scope.explorerGenes != null) {
                results = query ? scope.explorerGenes.filter(createFilterFor(query)) :
                    scope.explorerGenes,
                    deferred;
            }
        } else if (source == "geneList") {
            if ($rootScope.geneLists[scope.whichController] != null) {
                results = query ? $rootScope.geneLists[scope.whichController].filter(createFilterFor(query)) :
                    $rootScope.geneLists[scope.whichController],
                    deferred;
            }
        }

        if (self.simulateQuery) {
            deferred = $q.defer();
            $timeout(function() { deferred.resolve(results); }, Math.random() *
                1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(gene) {
            if (gene.value != null) {
                return (angular.lowercase(gene.value).indexOf(lowercaseQuery) === 0);
            } else {
                return (angular.lowercase(gene).indexOf(lowercaseQuery) === 0);
            }

        };
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
