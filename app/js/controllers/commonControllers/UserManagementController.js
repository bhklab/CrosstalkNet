'use strict';

(function() {
    angular.module('myApp.controllers').controller('UserManagementController', [
        '$scope',
        '$rootScope',
        'ValidationService', 'GlobalSharedData', '$q', '$timeout',
        '$mdDialog', 'QueryService',
        UserManagementController
    ]);

    /**
     * @namespace UserManagementController
     *
     * @desc Controller for creating and deleting users.
     *
     * @memberOf controllers
     */
    function UserManagementController($scope, $rootScope, ValidationService, GlobalSharedData,
        $q, $timeout, $mdDialog, QueryService) {
        var vm = this;

        vm.sharedData = GlobalSharedData.data;

        vm.closeDialog = closeDialog;
        vm.createUser = createUser;
        vm.deleteConfirm = deleteConfirm;
        vm.showCreateUserDialog = showCreateUserDialog;
        vm.showDeleteUsersDialog = showDeleteUsersDialog;

        vm.allUserNames = [];
        vm.usersToDelete = [];
        vm.user = { name: "", password: "" };

        /**
         * @summary Initializes the variables representing users to be created or deleted.
         *
         * @memberOf controllers.UserManagementController
         */
        function intializeVariables() {
            vm.allUserNames = [];
            vm.usersToDelete = [];
            vm.user = { name: "", password: "" };
        }

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.UserManagementController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            intializeVariables();
            getUserPermission();
        }

        /**
         * @summary Displays the create user dialog.
         *
         * @param {Object} ev The click event to be associated with the creation of the dialog.
         *
         * @memberOf controllers.UserManagementController
         */
        function showCreateUserDialog(ev) {
            $mdDialog.show({
                controller: function() { this.vm = vm },
                controllerAs: 'ctrl',
                templateUrl: '/app/partials/dialogs/createUserDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false,
                targetEvent: ev
            });
        }

        /**
         * @summary Displays the delete user dialog.
         *
         * @param {Object} ev The click event to be associated with the creation of the dialog.
         *
         * @memberOf controllers.UserManagementController
         */
        function showDeleteUsersDialog(ev) {
            refreshAllUsersNames();

            $mdDialog.show({
                controller: function() { this.vm = vm },
                controllerAs: 'ctrl',
                templateUrl: '/app/partials/dialogs/deleteUsersDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false,
                targetEvent: ev
            });
        }


        /**
         * @summary Displays the delete confirm dialog.
         *
         * @param {Object} ev The click event to be associated with the creation of the dialog.
         *
         * @memberOf controllers.UserManagementController
         */
        function deleteConfirm(ev) {
            var confirm = $mdDialog.confirm()
                .title('Confirm Delete?')
                .textContent('Are you sure you want to delete the users: ' + vm.usersToDelete.join(",") + '?')
                .ariaLabel('Confirm Delete')
                .targetEvent(ev)
                .clickOutsideToClose(false)
                .escapeToClose(false)
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                deleteUsers();
                vm.usersToDelete = [];
            }, function() {
                vm.usersToDelete = [];
            });
        }

        /**
         * @summary Closes the dialog currently being displayed.
         *
         * @memberOf controllers.UserManagementController
         */
        function closeDialog() {
            $mdDialog.hide('');
        }

        /**
         * @summary Retrieves a list of all usernames from the server.
         *
         * @memberOf controllers.UserManagementController
         */
        function refreshAllUsersNames() {
            QueryService.getAllUsersNames().then(function(result) {
                if (result.users) {
                    vm.allUserNames = result.users;
                }
            })
        }

        /**
         * @summary Retrieves the current user's permission level from the server.
         *
         * @memberOf controllers.UserManagementController
         */
        function getUserPermission() {
            QueryService.getUserPermission().then(function(result) {
                vm.sharedData.permission = result.permission;
            });
        }

        /**
         * @summary Creates a user based on the information entered in the create user dialog.
         *
         * @memberOf controllers.UserManagementController
         */
        function createUser() {
            QueryService.createUser([vm.user]).then(function(result) {
                if (!result.result) {
                    return;
                }

                alert(result.result);
                closeDialog();
            });

            vm.user = { name: "", password: "" };
        }

        /**
         * @summary Deletes a series of users based on those selected in the delete users dialog.
         *
         * @memberOf controllers.UserManagementController
         */
        function deleteUsers() {
            console.log(vm.usersToDelete);

            QueryService.deleteUsers(vm.usersToDelete).then(function(result) {
                if (!result.result) {
                    return;
                }

                refreshAllUsersNames();
                alert(result.result);
                closeDialog();
            });
        }
    }
})();
