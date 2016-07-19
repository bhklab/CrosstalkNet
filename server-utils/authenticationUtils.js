'use strict'

/**
 * The purpose of this file is to help with the retrieval of users,
 * and the setting of user tokens.
 *
 * @summary Utilities for managing and authenticating users.
 *
 * @requires jsonfile
 * @requires ./server-utils/users.json
 */

var jsonfile = require('jsonfile');
var user = require('./user');
var file = './server-utils/users.json';
var users = {};

/**
 * @summary Reads the JSON file specified and creates a cache of
 * users from its contents.
 *
 *
 * @param {string} file The path to a JSON file containing users.
 */
function loadUsers(file) {
    jsonfile.readFile(file, function(err, obj) {
        //console.log(obj);
        obj = obj.users;
        for (var prop in obj) {
            var temp = new user.User(obj[prop].name, obj[prop].password, obj[prop].accessLevel, obj[prop].token);
            users[temp.getName()] = temp;
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
    console.log("Adding token to user: " + user.getName());

    if (users[user.getName()] != null) {
        users[user.getName()].setToken(token);
        jsonfile.writeFile(file, { users: users }, function(err) {
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
        if (users[name].getToken() == token) {
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

    if (users[name] != null && users[name].getName() == name) {
        user = users[name];
    }

    callback(user);
}

loadUsers(file);

module.exports = {
    getUser: getUser,
    addTokenToUser: addTokenToUser,
    getUserFromToken: getUserFromToken
};
