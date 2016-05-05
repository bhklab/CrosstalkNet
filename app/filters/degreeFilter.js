//var filters = angular.module("myApp");
filters.filter('degreeFilter', function() {
  return function( items, degree) {
    var filtered = [];
    angular.forEach(items, function(item) {
      if(item.object.degree >= degree) {
        filtered.push(item);
      }
    });
    return filtered;
  };
});