var myModule = angular.module("myApp");
myModule.directive('staticInclude', function($http, $templateCache, $compile) {
    return {
        restrict: 'AE',
        templateUrl: function(ele, attrs) {
            return attrs.staticInclude;
        }
    };
    // var directive = {};

    // directive.link = function(scope, element, attrs) {
    //        var templatePath = attrs.staticInclude;
    //        $http.get(templatePath, { cache: $templateCache }).success(function(response) {
    //            var contents = element.html(response).contents();
    //            $compile(contents)(scope);
    //        });
    // }

    // return directive;
});
