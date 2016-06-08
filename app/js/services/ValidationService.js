var myModule = angular.module("myApp");
myModule.factory('ValidationService', function($http, $rootScope) {
    var service = {};
    service.checkServerResponse = checkServerResponse;

    function checkServerResponse(data) {
        if (data.error) {
            alert(data.error);
            return false;
        } else {
            return true;
        }
    }

    return service;
});
