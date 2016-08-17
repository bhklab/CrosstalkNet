'use strict';

(function() {
    angular.module('myApp.controllers').controller('LoginController', [
        '$scope',
        '$rootScope', 'RESTService',
        'ValidationService', 'GlobalSharedData', '$q', '$timeout', '$cookies',
        '$mdDialog',
        LoginController
    ]);

        /**
     * @namespace LoginController
     * @desc Controller for the login dialog.
     * @memberOf controllers
     */
    function LoginController($scope, $rootScope, RESTService, ValidationService, GlobalSharedData,
        $q, $timeout, $cookies, $mdDialog) {
        var vm = this;
        vm.ctrl = "login";

        $rootScope.tokenSet = false;
        vm.user = { name: null, password: null, token: null };

        vm.sharedData = GlobalSharedData.data;

        vm.guestLogin = guestLogin;
        vm.login = login;
        vm.logout = logout;

        vm.loggedIn = false;

        vm.showLoginDialog = showLoginDialog;

        /**
         * @summary Signs in the user as a guest giving them access to only
         * fake data and no ability to upload files.
         *
         * @memberOf controllers.LoginController
         */
        function guestLogin() {
            vm.loggedIn = true;
            $rootScope.tokenSet = true;
            vm.sharedData.guest = true;
            vm.sharedData.reloadMatrixFileList = true;
            vm.sharedData.reloadCommunityFileList = true;
            $mdDialog.hide('');
        }

        function logout() {
            vm.loggedIn = false;
            vm.sharedData.guest = false;
            $rootScope.tokenSet = false;
            $cookies.remove('token');
        }

        /**
         * @summary Sends a request to server to sign the user in given the current
         * username and password typed in the login dialog.
         *
         * @memberOf controllers.LoginController
         */
        function login() {
            RESTService.post('login', { user: vm.user })
                .then(function(data) {
                    vm.user = { name: null, password: null, token: null };
                    if (!ValidationService.checkServerResponse(data)) {
                        vm.loggedIn = false;
                        return;
                    } else {
                        var now = new Date();
                        var exp = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

                        $rootScope.tokenSet = true;
                        if (data.token != null) {
                            $cookies.put('token', data.token, { expires: exp });
                        }

                        vm.loggedIn = true;
                        vm.sharedData.guest = false;
                        vm.sharedData.reloadMatrixFileList = true;
                        vm.sharedData.reloadCommunityFileList = true;
                        $mdDialog.hide('');
                    }
                });
        }

        /**
         * @summary Checks to see if the JSON Web Token is found in the cookies. If so,
         * it attempts to login using it, otherwise it prompts the user to enter the name
         * and password.
         *
         * @memberOf controllers.LoginController
         */
        function checkToken() {
            if ($cookies.get('token') != null && $cookies.get('token') != 'null') {
                $rootScope.tokenSet = true;
                login();
            } else {
                showLoginDialog();
            }
        }

        /**
         * @summary Displays the login dialog.
         *
         * @memberOf controllers.LoginController
         */
        function showLoginDialog(ev) {
            vm.sharedData.guest = false;
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

        /**
         * @summary Watches the tokenSet variable for changes. When it becomes false,
         * the token is removed from the cookies and the user is prompted to login again.
         *
         * @memberOf controllers.LoginController
         */
        $rootScope.$watch('tokenSet', function(newValue, oldValue) {
            if (newValue == false && oldValue == true) {
                $cookies.remove('token');
                showLoginDialog();
            }
        });

        checkToken();
    }
})();
