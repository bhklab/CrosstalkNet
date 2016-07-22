'use strict';

angular.module('myApp.controllers').controller('LoginController', [
    '$scope',
    '$rootScope', 'RESTService',
    'ValidationService', 'SharedService', '$q', '$timeout', '$cookies',
    '$mdDialog',
    function($scope, $rootScope, RESTService, ValidationService, SharedService,
        $q, $timeout, $cookies, $mdDialog) {
        var vm = this;
        vm.ctrl = "login";

        $rootScope.tokenSet = false;
        vm.user = { name: null, password: null, token: null };

        vm.sharedData = SharedService.data.global;

        vm.answer = answer;
        vm.guestLogin = guestLogin;
        vm.login = login;

        function answer(answer) {
            $mdDialog.hide(answer);
        }

        function guestLogin() {
            $rootScope.tokenSet = true;
            vm.sharedData.guest = true;
            vm.sharedData.reloadFileList = true;
            $mdDialog.hide('');
        }

        function login() {
            RESTService.post('login', { user: vm.user })
                .then(function(data) {
                    vm.user = { name: null, password: null, token: null };
                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    } else {
                        var now = new Date();
                        var exp = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

                        $rootScope.tokenSet = true;
                        if (data.token != null) {
                            $cookies.put('token', data.token, { expires: exp });
                        }

                        vm.sharedData.reloadFileList = true;
                        $mdDialog.hide('');
                    }
                });
        }

        function checkToken() {
            if ($cookies.get('token') != null && $cookies.get('token') != 'null') {
                $rootScope.tokenSet = true;
                login();
            } else {
                showLoginDialog();
            }
        }

        function showLoginDialog(ev) {
            $mdDialog.show({
                controller: function() { this.vm = vm },
                controllerAs: 'ctrl',
                templateUrl: '/app/partials/dialogs/loginDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: false,
                targetEvent: ev
            });
        }

        $rootScope.$watch('tokenSet', function(newValue, oldValue) {
            if (newValue == false && oldValue == true) {
                $cookies.remove('token');
                showLoginDialog();
            }
        });

        $cookies.remove('token');
        checkToken();
    }
]);
