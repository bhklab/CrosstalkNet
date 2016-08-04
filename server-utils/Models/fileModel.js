'use strict'

/** 
 * Class representing a File. 
 */
class File {
    /**
     * @summary Create a File representing an Rdata File on the server.
     *
     * @param {string} name The name of the File.
     * @param {string} path The path of the File relative to server.js.
     * @param {string} type The type of the File Can be: real, fake, personal.
     * @param {string} subType The sub-type of the File. Can be: normal, tumor, delta.
     */
    constructor(name, path, type, subType) {
        if (arguments.length == 4) {
            this._name = name;
            this._path = path;
            this._type = type;
            this._subType = subType;
        } else if (arguments.length == 2) {
            this._name = name;
            this._path = path;
        }
    }

    /**
     * @summary Sets the File's name.
     *
     * @param {string} name The new name for the File.
     */
    set name(name) {
        this._name = name;
    }

    /**
     * @summary Sets the File's path.
     *
     * @param {string} path The new path for the File relative to
     * server.js.
     */
    set path(path) {
        this._path = path;
    }

    /**
     * @summary Sets the File's type.

     * @param {string} type The new type for the File. Can be either:
     * real, fake, or personal.
     */
    set type(type) {
        this._type = type;
    }

    /**
     * @summary Sets the File's subType.
     *.
     * @param {string} subType The new subType for the File. Can be either:
     * normal, tumor, or delta.
     */
    set subType(subType) {
        this._subType = subType;
    }

    /**
     * @summary Gets the File's name.
     *
     * @return {string} The File's name.
     */
    get name() {
        return this._name;
    }

    /**
     * @summary Get the File's path.
     *
     * @return {string} The File's path.
     */
    get path() {
        return this._path;
    }

    /**
     * @summary Get the File's type.
     *
     * @return {string} The File's type.
     */
    get type() {
        return this._type;
    }

    /**
     * @summary Get the File's sub type.
     *
     * @return {string} The File's sub type.
     */
    get subType() {
        return this._subType;
    }

    /**
     * @summary Returns File's client side representation.
     *
     * @return {Object} The client side representation of the File that 
     * does not contain the File path.
     */
    toClientSide() {
        return {
            name: this._name,
            type: this._type,
            subType: this._subType
        };
    }
}

module.exports = {
    File: File
};
