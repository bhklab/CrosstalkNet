'use strict'

/** Class representing a file. */
class File {
    /**
     * @summary Create a file representing an Rdata file on the server.
     *
     * @param {string} name The name of the file.
     * @param {string} path The path of the file relative to server.js.
     * @param {string} type The type of the file Can be: real, fake, personal.
     * @param {string} subType The sub-type of the file. Can be: normal, tumor, delta.
     */
    constructor(name, path, type, subType) {
        this._name = name;
        this._path = path;
        this._type = type;
        this._subType = subType;
    }

    /**
     * @summary Sets the file's name.
     *
     * @param {string} name The new name for the file.
     */
    set name(name) {
        this._name = name;
    }

    /**
     * @summary Sets the file's path.
     *
     * @param {string} path The new path for the file relative to
     * server.js.
     */
    set path(path) {
        this._path = path;
    }

    /**
     * @summary Sets the file's type.

     * @param {string} type The new type for the file. Can be either:
     * real, fake, or personal.
     */
    set type(type) {
        this._type = type;
    }

    /**
     * @summary Sets the file's subType.
     *.
     * @param {string} subType The new subType for the file. Can be either:
     * normal, tumor, or delta.
     */
    set subType(subType) {
        this._subType = subType;
    }

    /**
     * @summary Gets the file's name.
     * @return {string} The file's name.
     */
    get name() {
        return this._name;
    }

    /**
     * Get the file's path.
     * @return {string} The file's path.
     */
    get path() {
        return this._path;
    }

    /**
     * Get the file's type.
     * @return {string} The file's type.
     */
    get type() {
        return this._type;
    }

    /**
     * Get the file's sub type.
     * @return {string} The file's sub type.
     */
    get subType() {
        return this._subType;
    }
}

module.exports = {
    File: File
};
