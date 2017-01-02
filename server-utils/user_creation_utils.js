/**
 * Scripts for generating new users. Adds new users to the existing
 * users.json file by reading in new users from the newUsers.json file.
 * The format of the newUsers.json file is expected to be:
 * {"users": [{"name": "user1", "password": "password1"}, {"name": "user2", "password": "password2"}]}
 * New users will only get added if there isn't already an existing user with the same username.
 * New users all have an access level of "1" by default.
 * Keep in mind that passwords will be encrypted when saved.
 * Keep in mind that the newUsers.json file will get reset to containing
 * {"users": [{"name": "", "password": ""}]} for security reasons.
 */

var clone = require("clone");
var async = require("async");
var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
var user = require('../server-utils/models/user');
var existingUsersFile = './server-utils/models/users.json';
var newUsersFile = './user_creation/newUsers.json';

var CREATION_NAME_ERROR = "Request contains user with null or non-string name. " +
    "Please ensure every user has a 'name' propery and that its value is a string. ";

var PASSWORD_ERROR = "File contains user with null or non-string password. " +
    "Please ensure every user has a 'password' propery and that its value is a string. ";

var ALREAD_EXISTS_ERROR = "There is already a user named: ${temp.name} ." +
    "Please choose a different user name";

var FORBIDDEN_NAME_ERROR = "Having a user named: ${temp.name} is not permitted. " +
    "Please choose a different user name";

var NO_USERS_ERROR = "No users specified";

var DELETION_NAME_ERROR = "Request contians user with null or non-string name. " + 
    "Please ensure all user names specified for deletion are strings";
/**
 * @summary Reads the JSON file specified and creates a cache of
 * users from its contents.
 *
 *
 * @param {string} file The path to a JSON file containing users.
 */
function loadExistingUsers(file, callback) {
    jsonfile.readFile(file, function(err, obj) {
        var existingUsers = {};

        if (err !== null) {
            console.log(err);
        }

        obj = obj.users;

        for (var prop in obj) {
            var temp = new user.User(obj[prop]._name, obj[prop]._password, obj[prop]._accessLevel, obj[prop]._token);
            //console.log(temp);
            existingUsers[temp.name] = temp;
        }

        callback(err, existingUsers);
    });
}

function addNewUsers(existingUsers, newUsers) {
    var allUsers = clone(existingUsers);

    if (newUsers === null || !Array.isArray(newUsers) || newUsers.length === 0) {
        console.log(NO_USERS_ERROR);
        return { error: NO_USERS_ERROR };
    }

    for (var i = 0; i < newUsers.length; i++) {
        var temp = new user.User(newUsers[i].name, newUsers[i].password, "1", null);

        if (temp.name === null || temp.name === undefined || typeof temp.name !== "string" || temp.name.length === 0) {
            console.log(CREATION_NAME_ERROR);
            return { error: CREATION_NAME_ERROR };

        } else if (temp.password === null || temp.password === undefined || typeof temp.password !== "string" || temp.password.length === 0) {
            console.log(PASSWORD_ERROR);
            return { error: PASSWORD_ERROR };
        } else if (allUsers[temp.name] !== undefined) {
            console.log(ALREAD_EXISTS_ERROR);
            return { error: ALREAD_EXISTS_ERROR };
        } else if (temp.name === "error") {
            console.log(FORBIDDEN_NAME_ERROR);
            return { error: FORBIDDEN_NAME_ERROR };
        } else {
            var salt = bcrypt.genSaltSync(3);
            var encryptedPassword = bcrypt.hashSync(temp.password, salt);

            temp.password = encryptedPassword;
            allUsers[temp.name] = temp;
        }
    }

    return allUsers;
}

function removeSpecifiedUsers(existingUsers, specifiedUsers) {
    var trimmedUsers = clone(existingUsers);

    if (specifiedUsers === null || !Array.isArray(specifiedUsers) || specifiedUsers.length === 0) {
        console.log(NO_USERS_ERROR);
        return { error: NO_USERS_ERROR };
    }

    for (var i = 0; i < specifiedUsers.length; i++) {
        var name = specifiedUsers[i];

        if (name === null || typeof name !== 'string' || name.length === 0) {
            console.log(DELETION_NAME_ERROR);
            return { error: DELETION_NAME_ERROR };
        } else if (trimmedUsers[name] === undefined) {
            console.log("Could not find user: " + name);
            return { error: "Could not find user: " + name };
        } else {
            delete trimmedUsers[name];
        }
    }

    return trimmedUsers;
}

function saveAllUsers(file, users, callback) {
    jsonfile.writeFile(existingUsersFile, { users: users }, function(err) {
        if (err) {
            console.log(err);
        }

        callback(err, null);

        console.log(err);
    });
}

function createNewUsers(newUsers, mainCB) {
    async.waterfall([
            function(callback) {
                loadExistingUsers(existingUsersFile, callback);
            },
            function(existingUsers, callback) {
                // console.log(existingUsers);
                var allUsers = addNewUsers(existingUsers, newUsers);


                if (allUsers.error) {
                    callback(allUsers.error, allUsers);
                } else if (allUsers.Alex === null) {
                    callback("No users loaded", allUsers);
                } else {
                    callback(null, allUsers);
                }
            },
            function(allUsers, callback) {
                saveAllUsers(existingUsersFile, allUsers, callback);
            }
        ],
        // optional callback
        function(err, results) {
            if (err) {
                //console.log(err);
                mainCB(err, null);
            } else {
                console.log("Successfully added new users");
                mainCB(null, "Successfully added new users");
            }
        });
}

function deleteUsers(users, mainCB) {
    async.waterfall([
            function(callback) {
                loadExistingUsers(existingUsersFile, callback);
            },
            function(existingUsers, callback) {
                // console.log(existingUsers);
                var trimmedUsers = removeSpecifiedUsers(existingUsers, users);


                if (trimmedUsers.error) {
                    callback(trimmedUsers.error, trimmedUsers);
                } else {
                    callback(null, trimmedUsers);
                }
            },
            function(trimmedUsers, callback) {
                saveAllUsers(existingUsersFile, trimmedUsers, callback);
            }
        ],
        // optional callback
        function(err, results) {
            if (err) {
                //console.log(err);
                mainCB(err, null);
            } else {
                console.log("Successfully deleted users");
                mainCB(null, "Successfully deleted users");
            }
        });
}

module.exports = {
    createNewUsers: createNewUsers,
    deleteUsers: deleteUsers
}
