var myModule = angular.module("myApp.services");
myModule.factory('ValidationService', function($http, $rootScope) {
    var service = {};
    service.checkServerResponse = checkServerResponse;

    function checkServerResponse(data) {
        if (data.error) {
            alert(data.error);
            return false;
        } else if (data.success == false) {
            alert(data.message);
            $rootScope.tokenSet = false;
        } else if (data.fileStatus) {
            alert(data.fileStatus);
        }
        else {
            return true;
        }
    }

    return service;
});
