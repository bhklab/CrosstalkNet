'use strict';
/**
 * REST call factory. Contains functions that handle
 * HTTP requests and responses to and from the server.
 * @namespace services
 */

(function() {
	angular.module('myApp.services').factory('RESTService', RESTService);

	/**
     * @namespace RESTService
     *
     * @desc Factory for sending HTTP requests to the server.
     *
     * @memberOf services
     */
	function RESTService($http, $cookies, GlobalSharedData) {
		var SERVER_URL = 'http://localhost:5000/';
		// var SERVER_URL = 'http://crosstalknet.ca/';

		var service = {};

		service.get = get;
		service.post = post;
        
		/**
         * @summary Sends an HTTP GET request to the server.
         *
         * @param {String} path The path on the server to send the request to.
         * @param {Object} params An object containing additional information
         * to specify along with the request.
         *
         * @memberOf services.RESTService
         */
		function get(path, params) {
			return $http.get(SERVER_URL + path, params).then(function(result) {
				return result.data;
			});
		}

		/**
         * @summary Sends an HTTP POST request to the server.
         *
         * @param {String} path The path on the server to send the request to.
         * @param {Object} data An object containing additional information
         * to specify along with the request.
         *
         * @memberOf services.RESTService
         */
		function post(url, data) {
			// GlobalSharedData.data.guest ? data.token = 'guest' : data.token = $cookies.get('token');
			data.token = $cookies.get('token');
			return $http.post(SERVER_URL + url, data).then(function(result) {
				return result.data;
			});
		}

		return service;
	}
})();
