'use strict'

var jsonfile = require('jsonfile');
var file = './server-utils/users.json';
var users = null;

function loadUsers(file) {
    jsonfile.readFile(file, function(err, obj) {
        console.log(err);
        users = obj.users;
    });
}

function addTokenToUser(user, token) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].name == user.name) {
            users[i].token = token;
            jsonfile.writeFile(file, {users: users}, function(err) {
                console.log(err);
            });
        }
    }
}

function getUserFromToken(token) {
    if (token == null) {
        return null;
    }

    for (var i = 0; i < users.length; i++) {
        if (users[i].token == token) {
            return users[i];
        }
    }

    return null;
}

function getUser(name, callback) {
    var user = null;

    for (var i = 0; i < users.length; i++) {
        if (users[i].name == name) {
            user = users[i];
            break;
        }
    }

    callback(user);
}

loadUsers(file);

module.exports = {
    getUser: getUser,
    addTokenToUser: addTokenToUser,
    getUserFromToken: getUserFromToken
};
