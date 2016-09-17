'use strict'

/** 
 * Class representing a group of files. 
 */
class FileGroup {
    /**
     * @summary Creates a group of files organized by their network type. Network types include normal,
     * tumor, and delta.
     * 
     * @param {Array} normal An array of type File representing the files for normal-networks.
     * @param {Array} tumor An array of type File representing the files for tumor-networks.
     * @param {Array} delta An array of type File representing the files for delta-networks.
     */
    constructor(normal, tumor, delta) {
        if (!arguments.length) {
            this._normal = [];
            this._tumor = [];
            this._delta = [];
        } else {
            this._normal = normal;
            this._tumor = tumor;
            this._delta = delta;
        }
    }

    /**
     * @summary Sets the FileGroup's normal network Files.
     *
     * @param {Array} normal An array of type File representing the files for normal-networks.
     */
    set normal(normal) {
        this._normal = normal;
    }

    /**
     * @summary Sets the FileGroup's tumor network Files.
     *
     * @param {Array} normal An array of type File representing the files for tumor-networks.
     */
    set tumor(tumor) {
        return this._tumor = tumor;
    }

    /**
     * @summary Sets the FileGroup's delta network Files.
     *
     * @param {Array} normal An array of type File representing the files for delta-networks.
     */
    set delta(delta) {
        return this._delta = delta;
    }

    /**
     * @summary Get the FileGroup's normal-network files.
     *
     * @return {Array} The FileGroup's array of normal-network Files.
     */
    get normal() {
        return this._normal;
    }

    /**
     * @summary Get the FileGroup's tumor-network files.
     *
     * @return {Array} The FileGroup's array of tumor-network Files.
     */
    get tumor() {
        return this._tumor;
    }

    /**
     * @summary Get the FileGroup's delta-network files.
     *
     * @return {Array} The FileGroup's array of delta-network Files.
     */
    get delta() {
        return this._delta;
    }
}

module.exports = {
    FileGroup: FileGroup
};
