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
        loadingConfig: 6
    };

    service.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
        { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
    ];

    service.layouts = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "concentric"
    }, { display: "Hierarchical", value: "hierarchical" },{ display: "Random", value: "random" }];

    service.loadDropdownOptions = loadDropdownOptions;
    service.querySearch = querySearch;

    function loadDropdownOptions(cy, selectedGene = null) {
        var genes = [];
        var selectedGeneName = selectedGene == null ? '' : ', #' + selectedGene.toUpperCase();
        cy.nodes().not('#epi, #stroma' + selectedGeneName).forEach(function(
            node) {
            genes.push(node.data());
        });

        return genes.map(function(gene) {
            return {
                value: gene.id.toLowerCase(),
                display: gene.id + ' ' + gene.degree,
                object: gene
            };
        });
    }

    function querySearch(query, source, scope) {
        if (source == "first") {
            var results = query ? scope.genesFirst.filter(createFilterFor(query)) :
                scope.genesFirst,
                deferred;
        } else {
            var results = query ? scope.genesSecond.filter(createFilterFor(query)) :
                scope.genesSecond,
                deferred;
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
            return (gene.value.indexOf(lowercaseQuery) === 0);
        };
    }

    return service;
});
