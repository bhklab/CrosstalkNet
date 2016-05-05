var myModule = angular.module("myApp");
myModule.factory('RESTService', function($http) {
	var SERVER_URL = "http://localhost:5000/";
	var service = {
		get: function(url) {
			return $http.get(SERVER_URL + url).then(function(result) {
				return result.data;
			});
		},
		post: function(url, data) {
			return $http.post(SERVER_URL + url, data).then(function(result) {
				return result.data;
			});
		}
	}

	return service;
});