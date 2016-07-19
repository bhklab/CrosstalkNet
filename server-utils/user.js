'use strict'

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
        this.name = name;
        this.password = password;
        this.accessLevel = accessLevel;
        this.token = token;
    }

    /**
     * Sets the users's token.
     * @param {string} token The new JSON Web Token for the user.
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Get the user's name.
     * @return {string} The user's name.
     */
    getName() {
        return this.name;
    }

    /**
     * Get the user's hashed password.
     * @return {string} The user's hashed password.
     */
    getPassword() {
        return this.password;
    }

    /**
     * Get the user's access level.
     * @return {string} The user's access level.
     */
    getAccessLevel() {
        return this.accessLevel;
    }

    /**
     * Get the user's token.
     * @return {string} The user's token.
     */
    getToken() {
        return this.token;
    }
}

module.exports = {
    User: User
};
