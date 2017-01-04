'use strict';

(function() {
    angular.module('myApp.controllers').controller('LoginController', [
        '$scope',
        '$rootScope', 'RESTService',
        'ValidationService', 'GlobalSharedData', '$q', '$timeout', '$cookies',
        '$mdDialog', 'QueryService',
        LoginController
    ]);

    /**
     * @namespace LoginController
     *
     * @desc Controller for the login dialog.
     *
     * @memberOf controllers
     */
    function LoginController($scope, $rootScope, RESTService, ValidationService, GlobalSharedData,
        $q, $timeout, $cookies, $mdDialog, QueryService) {
        var vm = this;
        vm.ctrl = "login";

        if ($rootScope.tokenSet != true) {
            $rootScope.tokenSet = false;
        }

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
            $cookies.put('token', 'guest');
            vm.user = { name: null, password: null, token: null };
            login(vm.user);

            vm.sharedData.guest = true;
            $mdDialog.hide('');
        }

        /**
         * @summary Clears variables on the client side thereby logging out the user.
         *
         * @memberOf controllers.LoginController
         */
        function logout() {
            vm.loggedIn = false;
            vm.sharedData.guest = false;
            // $rootScope.tokenSet = false;
            $cookies.remove('token');
            GlobalSharedData.resetGlobalData();
            GlobalSharedData.resetPermission();
        }

        /**
         * @summary Sends a request to server to sign the user in given the current
         * username and password typed in the login dialog.
         *
         * @memberOf controllers.LoginController
         */
        function login(user) {
            RESTService.post('login', { user: user })
                .then(function(data) {
                    vm.user = { name: null, password: null, token: null };
                    $mdDialog.hide('');

                    if (!ValidationService.checkServerResponse(data)) {
                        logout();
                        showLoginDialog();
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
            if ($cookies.get('token') != null && $cookies.get('token') != 'null' && $cookies.get('token') != 'guest') {
                // $rootScope.tokenSet = true;
                login({ name: null, password: null, token: null });
            } else {
                // console.log("-----checkToken triggered-------");
                showLoginDialog();
            }
        }

        /**
         * @summary Displays the login dialog.
         *
         * @param {Object} ev The click event to be associated with the creation of the dialog.
         *
         * @memberOf controllers.LoginController
         */
        function showLoginDialog(ev) {
            vm.sharedData.guest = false;
            $mdDialog.hide('');
            $mdDialog.show({
                controller: function() { this.vm = vm },
                controllerAs: 'ctrl',
                templateUrl: '/app/partials/dialogs/loginDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: true,
                escapeToClose: false,
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
            if (newValue == false && oldValue == true && vm.sharedData.permission != 0) {
                // $cookies.remove('token');
                // showLoginDialog();
                // console.log("------Tokenset Watch Triggered------");
                logout();
                showLoginDialog();
            }
        });

        /**
         * @summary Watches for changes in address of the webapp in order to determine 
         * whether or not to show the login dialog.
         *
         * @memberOf controllers.LoginController
         */
        $scope.$on("$locationChangeStart", function(event, next, current) {
            // console.info("location changing to:" + next);
            $mdDialog.hide('');
            if (next.endsWith('documentation')) {
                $mdDialog.hide('');
            } else if ($cookies.get('token') == 'guest' || $cookies.get('token') == null) {
                logout();
                showLoginDialog();
            } else {
                checkToken();
            }
        });
    }
})();
