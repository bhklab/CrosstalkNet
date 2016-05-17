//var filters = angular.module("myApp");
filters.filter('interactionFilter', function() {
    return function(edges, name) {
        var filtered = [];
        if (name == null || name == "") {
        	return edges;
        }

        angular.forEach(edges, function(edge) {
            if (edge.source().id().toLowerCase().indexOf(name.toLowerCase()) >= 0 || edge.target().id().toLowerCase().indexOf(name.toLowerCase()) >= 0) {
                filtered.push(edge);
            }
        });
        return filtered;
    };
});
