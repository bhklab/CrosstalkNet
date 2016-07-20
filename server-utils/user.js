'use strict'

// var nameSymbol = Symbol();
// var nameSymbol = Symbol();
// var nameSymbol = Symbol();
// var nameSymbol = Symbol();

/** Class representing a user. */
class User {
    /**
     * Create a user.
     * @param {string} name The name of the user. Names should be unique between users.
     * @param {string} password The hashed password of the user.
     * @param {string} accessLevel The access level for the user.
     * @param {string} token The JSON Web Token associated with the user .
     */
    constructor(name, password, accessLevel, token) {
        this._name = name;
        this._password = password;
        this._accessLevel = accessLevel;
        this._token = token;
    }

    /**
     * Sets the users's name.
     * @param {string} name The new name for the user.
     */
    set name(name) {
        this._name = name;
    }

    /**
     * Sets the users's password.
     * @param {string} password The new password for the user.
     */
    set password(password) {
        this._password = password;
    }

        /**
     * Sets the users's access level.
     * @param {string} accessLevel The new access level for the user.
     */
    set accessLevel(accessLevel) {
        this._accessLevel = accessLevel;
    }

    /**
     * Sets the users's token.
     * @param {string} token The new JSON Web Token for the user.
     */
    set token(token) {
        this._token = token;
    }

    /**
     * Gets the user's name.
     * @return {string} The user's name.
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the user's hashed password.
     * @return {string} The user's hashed password.
     */
    get password() {
        return this._password;
    }

    /**
     * Gets the user's access level.
     * @return {string} The user's access level.
     */
    get accessLevel() {
        return this._accessLevel;
    }

    /**
     * Gets the user's token.
     * @return {string} The user's token.
     */
    get token() {
        return this._token;
    }
}

module.exports = {
    User: User
};
