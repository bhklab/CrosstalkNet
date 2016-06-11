var myModule = angular.module("myApp");
myModule.factory('BasicDataService', function($http, $rootScope) {
    var service = {};

    service.states = {
        initial: { id: 0, text: "Waiting for user to query..." },
        loadingGraph: { id: 1, text: "Getting graph from server..." },
        loadingConfig: { id: 2, text: "Initializing graph..." },
        showingGraph: { id: 3, text: "Graph finished" },
        gettingGeneList: { id: 4, text: "Getting gene list..." },
        gettingAllPaths: { id: 5, text: "Getting all paths between source and target genes..." },
        finishedGettingAllPaths: { id: 6, text: "All paths have been obtained" }
    };

    service.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
        { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
    ];

    service.layouts = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Random", value: "random" }];

    service.loadDropdownOptions = loadDropdownOptions;
    service.loadGeneListDropdownOptions = loadGeneListDropdownOptions;
    service.loadNeighbourDropdownOptions = loadNeighbourDropdownOptions;
    service.querySearch = querySearch;
    service.getNodesWithMinDegree = getNodesWithMinDegree;
    service.setNeighboursGeneral = setNeighboursGeneral;

    function initializeStandardVariables(scope) {
        scope.selectedItemFirst = null;
        scope.selectedGOI = null;
        scope.zoomGene = null;
        scope.searchTextGOI = "";
        scope.searchTextFirst = "";
        scope.searchTextSecond = "";
        scope.searchTextZoom = "";
        scope.minPositiveWeight = 0;
        scope.minNegativeWeight = 0;
        scope.ctrl = "main";

        scope.pValues = angular.copy(service.pValues);
        scope.layouts = angular.copy(service.layouts);
    }

    function loadDropdownOptions(cy, selectedGenes = null) {
        var genes = [];
        var selectedGenesStr = "";
        var parentContainers = "#par0";
        var parents = "";

        for (var i = 0; i < selectedGenes.length; i++) {
            selectedGenesStr += ', #' + selectedGenes[i].value;
            parentContainers += ", #par" + (i + 1);
            parents += ", [parent='par" + i + "']"
        }

        cy.nodes().not(parentContainers + parents + selectedGenesStr).forEach(function(
            node) {
            genes.push(node.data());
        });

        return genes.map(function(gene) {
            return {
                value: gene.id,
                display: gene.id + ' ' + gene.degree,
                object: gene
            };
        });
    }

    function loadNeighbourDropdownOptions(cy, selectedGenes) {
        var genes = [];

        cy.edges("[source='" + selectedGenes[selectedGenes.length - 1].value + "']").forEach(function(
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

    function loadGeneListDropdownOptions(geneList) {
        return geneList.map(function(gene) {
            return {
                value: gene.name,
                display: gene.name + ' ' + gene.degree,
                object: gene
            };
        });
    }

    function loadFileListDropdownOptions(fileList) {
        return fileList.map(function(file) {
            return {
                value: file,
                pValue: file.split(".")
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
        } else if (source == "first") {
            if (scope.firstNeighbourDropdownOptions != null) {
                results = query ? scope.firstNeighbourDropdownOptions.filter(createFilterFor(query)) :
                    scope.firstNeighbourDropdownOptions,
                    deferred;
            }
        } else if (source == "geneList") {
            if ($rootScope.geneList != null) {
                results = query ? $rootScope.geneList.filter(createFilterFor(query)) :
                    $rootScope.geneList,
                    deferred;
            }
        } else {
            if (scope.genesSecond != null) {
                results = query ? scope.genesSecond.filter(createFilterFor(query)) :
                    scope.genesSecond,
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
            var temp = { epi: [], stroma: [] };
            temp = getNeighboursFromEdges(scope, i);
            /*
            if (isExplorer) {
                var epi = getNeighboursForLevelInteractionExplorer(scope, i, "epi");
                var stroma = getNeighboursForLevelInteractionExplorer(scope, i, "stroma");
            } else {
                var epi = getNeighboursForLevel(scope, i, "epi");
                var stroma = getNeighboursForLevel(scope, i, "stroma");
            }
            temp.epi = epi;
            temp.stroma = stroma;*/

            neighbours.push(temp);
        }

        scope.neighbours = neighbours;
    }

    function getNeighboursForLevel(scope, level, side) {
        var result = scope.cy.filter(function(i, element) {
            if (element.isNode() && (element.data('neighbourLevel') == level || level == 1 && element.data('neighbourLevel') == -1 || (level > 1 && (element.data('neighbourLevel') == level || element.data('neighbourLevel') == level - 1))) && element.hasClass(side)) {
                return true;
            }

            return false;
        });

        result = result.map(function(node) {
            return node.id();
        });

        return result;
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

    function getNeighboursForLevelInteractionExplorer(scope, level, side) {
        var result = scope.cy.filter(function(i, element) {
            if (element.isNode() && (element.data('neighbourLevel') == level) && element.hasClass(side)) {
                return true;
            }

            return false;
        });

        result = result.map(function(node) {
            return node.id();
        });

        return result;
    }

    return service;
});
