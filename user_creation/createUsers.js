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

var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
var user = require('../server-utils/Models/user');
var existingUsersFile = './server-utils/Models/users.json';
var newUsersFile = './user_creation/newUsers.json';

/**
 * @summary Reads the JSON file specified and creates a cache of
 * users from its contents.
 *
 *
 * @param {string} file The path to a JSON file containing users.
 */
function loadExistingUsers(file, callback) {
    jsonfile.readFile(file, function(err, obj) {
        var users = {};

        console.log(err);
        obj = obj.users;



        for (var prop in obj) {
            var temp = new user.User(obj[prop]._name, obj[prop]._password, obj[prop]._accessLevel, obj[prop]._token);
            //console.log(temp);
            users[temp.name] = temp;
        }

        callback(newUsersFile, users, saveAllUsers)
    });
}

function loadNewUsers(file, existingUsers, callback) {
    jsonfile.readFile(file, function(err, obj) {
        if (err) {
            console.log(err);
        }

        if (obj == null || obj.users == null || !Array.isArray(obj.users)) {
            console.log("Please make sure that the file contains a single object with a property 'users'.");
            console.log("Also make sure that the value of the 'users' property is an array.");
            return;
        }

        var newUsers = obj.users;

        for (var i = 0; i < newUsers.length; i++) {
            var temp = new user.User(newUsers[i].name, newUsers[i].password, "1", null);

            if (temp.name == null || typeof temp.name != "string" || temp.name.length == 0) {
                console.log("File contains user with null or non-string name.");
                console.log("Please ensure every user has a 'name' propery and that its value is a string.");
                return;

            } else if (temp.password == null || typeof temp.password != "string" || temp.password.length == 0) {
                console.log("File contains user with null or non-string password.");
                console.log("Please ensure every user has a 'password' propery and that its value is a string.");
                return;
            } else if (existingUsers[temp.name] != null) {
                console.log("There is already a user named: " + temp.name + ".");
                console.log("Please choose a different user name");
                return;
            } else {
                var salt = bcrypt.genSaltSync(3);
                var encryptedPassword = bcrypt.hashSync(temp.password, salt);

                temp.password = encryptedPassword;
                existingUsers[temp.name] = temp;
            }
        }

        callback(file, existingUsers);
    });
}

function saveAllUsers(file, users) {
    jsonfile.writeFile(existingUsersFile, { users: users }, function(err) {
        console.log(err);
    });

    jsonfile.writeFile(newUsersFile, { users: [{ name: "", password: "" }] }, function(err) {
        console.log(err);
    });
}

loadExistingUsers(existingUsersFile, loadNewUsers);
