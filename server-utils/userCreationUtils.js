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
var user = require('../server-utils/Models/user');
var existingUsersFile = './server-utils/Models/users.json';
var newUsersFile = './user_creation/newUsers.json';

var NAME_ERROR = "File contains user with null or non-string name. " +
    "Please ensure every user has a 'name' propery and that its value is a string. ";

var PASSWORD_ERROR = "File contains user with null or non-string password. " +
    "Please ensure every user has a 'password' propery and that its value is a string. ";

var ALREAD_EXISTS_ERROR = "There is already a user named: ${temp.name} ." +
    "Please choose a different user name";

var FORBIDDEN_NAME_ERROR = "Having a user named: ${temp.name} is not permitted. " +
    "Please choose a different user name";
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

        if (err != null) {
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

    if (newUsers == null || newUsers.users == null || !Array.isArray(newUsers.users)) {
        console.log("No users specified");
        return { error: "No users specified" };
    }

    for (var i = 0; i < newUsers.users.length; i++) {
        var temp = new user.User(newUsers.users[i].name, newUsers.users[i].password, "1", null);

        if (temp.name == null || typeof temp.name != "string" || temp.name.length == 0) {
            console.log(NAME_ERROR);
            return { error: NAME_ERROR };

        } else if (temp.password == null || typeof temp.password != "string" || temp.password.length == 0) {
            console.log(PASSWORD_ERROR);
            return { error: PASSWORD_ERROR };
        } else if (existingUsers[temp.name] != null || allUsers[temp.name] != null) {
            console.log(ALREAD_EXISTS_ERROR);
            return { error: ALREAD_EXISTS_ERROR };
        } else if (temp.name == "error") {
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
                } else if (allUsers.Alex == null) {
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
                mainCB({ error: err }, null);
            } else {
                console.log("Successfully added new users");
                mainCB(null, {success: "Successfully added new users"});
            }
        });
}

module.exports = {
    createNewUsers: createNewUsers
}
