var myModule = angular.module("myApp");
myModule.factory('SharedService', function($http, $timeout, Upload) {
    var service = {};

    service.selectedFile = {file: null};

    return service;
});
