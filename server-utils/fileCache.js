'use strict'

/** Class representing all available Rdata files. */
class FileCache {
    /**
     * @summary Create a file cache representing existing Rdata files.
     *
     * @param {FileGroup} real The FileGroup containing all proprietary, public matrices.
     * @param {FileGroup} fake The FileGroup containing all fake matrices.
     * @param {Object} personal An object whose keys are user names and whose objects are
     * FileGroups for a specific user's uploaded files.
     */
    constructor(real, fake, personal) {
        this._real = real;
        this._fake = fake;
        this._personal = personal;
    }

    /**
     * @summary Sets the FileCache's real FileGroup.
     *
     * @param {FileGroup} real The new FileGroup for the FileCache's real FileGroup.
     */
    set real(real) {
        this._real = real;
    }

    /**
     * @summary Sets the FileCache's fake FileGroup.
     *
     * @param {FileGroup} real The new FileGroup for the FileCache's fake FileGroup.
     */
    set fake(fake) {
        this._fake = fake;
    }

    /**
     * @summary Sets the FileCache's personal object of FileGroups.
     *
     * @param {Object} personal The new object of FileGroups repersenting user uploaded files
     * for the FileCache. The keys of this object are user names and the values are FileGroups
     * for a user's uploaded files.
     */
    set personal(personal) {
        this._personal = personal;
    }

    /**
     * @summary Gets the FileCache's proprietary FileGroup.
     *
     * @return {FileGroup} The FileCache's proprietary FileGroup of real data.
     */
    get real() {
        return this._real;
    }

    /**
     * @summary Gets the FileCache's fake FileGroup.
     *
     * @return {FileGroup} The FileCache's FileGroup of fake data.
     */
    get fake() {
        return this._fake;
    }

    /**
     * @summary Gets the FileCache's object of  FileGroup.
     *
     * @return {Object} The FileCache's object of FileGroups of personal data. The keys of this object are
     * user names and the values are FileGroups for a user's uploaded files.
     */
    get personal() {
        return this._personal;
    }
}

module.exports = {
    FileCache: FileCache
};
