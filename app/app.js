'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
	'ngRoute',
	'ngMaterial',
	'ngCookies',
	'ngFileUpload',
	'md.data.table',
	'myApp.controllers',
	'myApp.directives',
	'myApp.filters',
	'myApp.services',
]).config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('light-blue', {
			'default': 'A700', // by default use shade 400 from the pink palette for primary intentions
			'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
			'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
			'hue-3': 'A700' // use shade A100 for the <code>md-hue-3</code> class
		})
		.accentPalette('orange', {
			'default': '500',
			'hue-1': '600',
			'hue-2': '700',
			'hue-3': '800'
		});
});

angular.module('myApp').config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/documentation', {
				templateUrl: 'partials/documentation.html',
				css: 'app.css'
			}).
			when('/app', {
				templateUrl: 'partials/app.html',
				css: 'app.css'
			}).
			otherwise({
				redirectTo: '/documentation'
			});
	}
]);


angular.module('myApp.directives', []);
angular.module('myApp.filters', []);
angular.module('myApp.controllers', []);
angular.module('myApp.services', []);
angular.module('myApp.mainGraph', []);
