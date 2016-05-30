var myModule = angular.module("myApp");
myModule.directive('staticInclude', function($http, $templateCache, $compile) {
	var directive = {};
		
	directive.link = function(scope, element, attrs) {
        var templatePath = attrs.staticInclude;
        $http.get(templatePath, { cache: $templateCache }).success(function(response) {
            var contents = element.html(response).contents();
            $compile(contents)(scope);
        });
	}

	return directive;

	


    // return function(scope, element, attrs) {

    // };
});