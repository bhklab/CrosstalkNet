var myModule = angular.module("myApp");
myModule.factory('BasicDataService', function($http) {
    var service = {};

    service.states = {
        initial: 0,
        firstDropdown: 1,
        secondDropdown: 2,
        loadingFirst: 3,
        loadingSecond: 4,
        loading: 5,
        loadingConfig: 6,
        showingGraph: 7,
        gettingGeneList: 8
    };

    service.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
        { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
    ];

    service.layouts = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Hierarchical", value: "hierarchical" }, { display: "Random", value: "random" }];

    service.loadDropdownOptions = loadDropdownOptions;
    service.loadGeneListDropdownOptions = loadGeneListDropdownOptions;
    service.querySearch = querySearch;
    service.getNodesWithMinDegree = getNodesWithMinDegree;
    service.setNeighbours = setNeighbours;

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
            if (scope.geneList != null) {
                results = query ? scope.geneList.filter(createFilterFor(query)) :
                    scope.geneList,
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

    function setNeighbours(scope, level) {
        if (level == 1) {
            scope.firstNeighbours.epi = scope.cy.filter(function(i, element) {
                if (element.isNode() && (element.data('neighbourLevel') == level || element.data('neighbourLevel') == -1) && element.hasClass('epi')) {
                    return true;
                }

                return false;
            });

            scope.firstNeighbours.stroma = scope.cy.filter(function(i, element) {
                if (element.isNode() && (element.data('neighbourLevel') == level || element.data('neighbourLevel') == -1) && element.hasClass('stroma')) {
                    return true;
                }

                return false;
            });

            scope.firstNeighbours.epi = scope.firstNeighbours.epi.map(function(node) {
                return node.id();
            });

            scope.firstNeighbours.stroma = scope.firstNeighbours.stroma.map(function(node) {
                return node.id();
            });

        } else if (level == 2) {
            scope.secondNeighbours.epi = scope.cy.filter(function(i, element) {
                if (element.isNode() && element.data('neighbourLevel') >= 1 && element.hasClass('epi')) {
                    return true;
                }

                return false;
            });

            scope.secondNeighbours.stroma = scope.cy.filter(function(i, element) {
                if (element.isNode() && element.data('neighbourLevel') >= 1 && element.hasClass('stroma')) {
                    return true;
                }

                return false;
            });

            scope.secondNeighbours.epi = scope.secondNeighbours.epi.map(function(node) {
                return node.id();
            });

            scope.secondNeighbours.stroma = scope.secondNeighbours.stroma.map(function(node) {
                return node.id();
            });
        }
    };

    return service;
});
