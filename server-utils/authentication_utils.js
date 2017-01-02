'use strict'

/**
 * The purpose of this file is to help with the retrieval of users,
 * and the setting of user tokens.
 *
 * @summary Utilities for managing and authenticating users.
 *
 * @requires './user'
 * @requires jsonfile 
 * @requires ./server-utils/users.json
 */

var jsonfile = require('jsonfile');
var user = require('./models/user');
var EXISTING_USERS_FILE = './server-utils/models/users.json';
var users = {};

/**
 * @summary Reads the JSON file specified and creates a cache of
 * users from its contents.
 *
 *
 * @param {string} file The path to a JSON file containing users.
 */
function loadUsers(file) {
    users = {};

    jsonfile.readFile(file, function(err, obj) {
        //console.log(obj);
        obj = obj.users;
        for (var prop in obj) {
            var temp = new user.User(obj[prop]._name, obj[prop]._password, obj[prop]._accessLevel, obj[prop]._token);
            //console.log(temp);
            users[temp.name] = temp;
        }

        //console.log("Users: %j", users);

        jsonfile.writeFile(file, { users: users }, function(err) {
            console.log(err);
        });
    });
}

/**
 * @summary Adds the provided JSON Web Token to the specfied 
 * user.
 *
 * @param {User} user The user to add the token to.
 * @param {string} token The JSON Web Token to add to the user.
 */
function addTokenToUser(user, token) {
    console.log("Adding token to user: " + user.name);

    if (users[user.name] != null) {
        users[user.name].token = token;
        jsonfile.writeFile(EXISTING_USERS_FILE, { users: users }, function(err) {
            console.log(err);
        });
    }
}

/**
 * @summary Retrieves the user with the specified JSON Web Token from the 
 * cache of users.
 *
 * @param {string} token The JSON Web Token that is used to identify the user.
 * @return {User} If a user with the specified token exists, return that User. 
 * Otherwise return null.
 */
function getUserFromToken(token) {
    if (token == null) {
        return null;
    }

    for (var name in users) {
        if (users[name].token == token) {
            return users[name];
        }
    }

    return null;
}

/**
 * @summary Retrieves the user with the given name from the 
 * cache of users and calls a callback function.
 *
 * @param {string} name The unique name that is used to identify the user.
 * @return {User} If a user with the specified name is found, the callback
 * function is called with that user, otherwise it is called with null.
 */
function getUser(name, callback) {
    var user = null;

    if (users[name] != null && users[name].name == name) {
        user = users[name];
    }

    callback(user);
}

function getAllUserNames() {
    var names = [];

    for (var name in users) {
        if (users[name].accessLevel != "admin") {
            names.push(users[name].name);
        }
    }

    return names;
}

loadUsers(EXISTING_USERS_FILE);

module.exports = {
    loadUsers: loadUsers,
    getUser: getUser,
    addTokenToUser: addTokenToUser,
    getUserFromToken: getUserFromToken,
    getAllUserNames: getAllUserNames,
    EXISTING_USERS_FILE: EXISTING_USERS_FILE
};
