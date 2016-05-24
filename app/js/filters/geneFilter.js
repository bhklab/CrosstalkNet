//var filters = angular.module("myApp");
filters.filter('geneFilter', function() {
    return function(genes, side) {
        var filtered = [];
        if (side == null || side == "") {
        	return genes;
        }

        filtered = genes.$('.' + side);
/*
        angular.forEach(genes, function(gene) {
            if (gene.data.parent == side) {
                filtered.push(gene);
            }
        });*/
        return filtered;
    };
});
