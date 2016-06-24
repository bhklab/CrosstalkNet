var myModule = angular.module("myApp.services");
myModule.factory('SharedService', function($http, $timeout, $rootScope) {
    var service = {};
    var dataModel = {reloadFileList: false};

    service.data = {delta: angular.copy(dataModel), nonDelta: angular.copy(dataModel)};

    return service;
});
