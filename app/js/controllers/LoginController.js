'use strict';

controllers.controller('LoginController', [
    '$scope',
    '$rootScope', 'RESTService',
    'ValidationService', 'SharedService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, ValidationService, SharedService,
        $q, $timeout, $cookies, $mdDialog) {
        $scope.ctrl = "login";

        $rootScope.tokenSet = false;
        $scope.user = { name: null, password: null, token: null };

        $scope.sharedData = SharedService.data;

        $rootScope.$watch('tokenSet', function(newValue, oldValue) {
            if (newValue == false && oldValue == true) {
                $cookies.remove('token');
                $scope.showLoginDialog();
            }
        });

        $scope.checkToken = function() {
            if ($cookies.get('token') != null && $cookies.get('token') != 'null') {
                $rootScope.tokenSet = true;
                $scope.login();
            } else {
                $scope.showLoginDialog();
            }
        };

        $scope.showLoginDialog = function(ev) {
            $mdDialog.show({
                    controller: function() { this.parent = $scope; },
                    controllerAs: 'ctrl',
                    templateUrl: '../../partials/dialogs/loginDialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    fullscreen: false,
                    targetEvent: ev
                })
                .then(function(answer) {

                }, function() {

                });
        };

        $scope.login = function() {
            RESTService.post('login', { user: $scope.user })
                .then(function(data) {
                    $scope.user = { name: null, password: null, token: null };
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    } else {
                        var now = new Date();
                        var exp = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

                        $rootScope.tokenSet = true;
                        if (data.token != null) {
                            $cookies.put('token', data.token, { expires: exp });
                        }
                        
                        $scope.sharedData.delta.reloadFileList = true;
                        $scope.sharedData.nonDelta.reloadFileList = true;
                        $mdDialog.hide('');
                    }
                });
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

        $scope.checkToken();
    }
]);
