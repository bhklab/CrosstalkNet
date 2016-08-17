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
     * @desc Controller for the login dialog.
     * @memberOf controllers
     */
    function UserManagementController($scope, $rootScope, ValidationService, GlobalSharedData,
        $q, $timeout, $mdDialog, QueryService) {
        var vm = this;

        vm.sharedData = GlobalSharedData.data;

        vm.closeDialog = closeDialog;
        vm.createUsers = createUsers;
        vm.deleteConfirm = deleteConfirm;
        vm.showCreateUsersDialog = showCreateUsersDialog;
        vm.showDeleteUsersDialog = showDeleteUsersDialog;

        vm.allUserNames = [];
        vm.usersToDelete = [];
        vm.user = { name: "", password: "" };

        function intializeVariables() {
            vm.ctrl = ctrl;
            vm.allUserNames = [];
            vm.usersToDelete = [];
            vm.user = { name: "", password: "" };
        }

        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            intializeVariables();
            getUserPermission();
        }

        function showCreateUsersDialog(ev) {
            $mdDialog.show({
                controller: function() { this.vm = vm },
                controllerAs: 'ctrl',
                templateUrl: '/app/partials/dialogs/createUsersDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false,
                targetEvent: ev
            });
        }

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

        function closeDialog() {
            $mdDialog.hide('');
        }

        function refreshAllUsersNames() {
            QueryService.getAllUsersNames().then(function(result) {
                if (result.users) {
                    vm.allUserNames = result.users;
                }
            })
        }

        function getUserPermission() {
            QueryService.getUserPermission().then(function(result) {
                vm.sharedData.permission = result.permission;
            });
        }

        function createUsers() {
            var newUsers = [];;

            newUsers.push(vm.user);

            QueryService.createUsers(newUsers).then(function(result) {
                if (!result.result) {
                    return;
                }

                alert(result.result);
                closeDialog();
            });

            vm.user = { name: "", password: "" };
        }

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
