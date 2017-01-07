'use strict'
var clone = require('clone');

const TYPES = { real: "real", fake: "fake", personal: "personal" };

/** 
 * Class representing all available community Rdata files. 
 */
class CommunityFileCache {
    /**
     * @summary Create a file cache representing existing community Rdata files.
     *
     * @param {Array} real An array containing all proprietary, public communities.
     * @param {Array} fake An array containing all the fake communities.
     * @param {Object} personal An object whose keys are user names and whose objects are
     * Arrays for a specific user's uploaded files.
     */
    constructor(real, fake, personal) {
        if (!arguments.length) {
            this._real = [];
            this._fake = [];
            this._personal = {};
        } else {
            this._real = real;
            this._fake = fake;
            this._personal = personal;
        }
    }

    /**
     * @summary Sets the CommunityFileCache's array of real files.
     *
     * @param {Array} real The new array of Files for the CommunityFileCache's real files.
     */
    set real(real) {
        this._real = real;
    }

    /**
     * @summary Sets the CommunityFileCache's array of fake files.
     *
     * @param {Array} real The new array of Files for the CommunityFileCache's fake files.
     */
    set fake(fake) {
        this._fake = fake;
    }

    /**
     * @summary Sets the CommunityFileCache's personal object of arrays of files.
     *
     * @param {Object} personal The new object of arrays repersenting user uploaded files
     * for the CommunityFileCache. The keys of this object are user names and the values are arrays
     * of Files for a user's uploaded files.
     */
    set personal(personal) {
        this._personal = personal;
    }

    /**
     * @summary Gets the CommunityFileCache's array of real files.
     *
     * @return {Array} The CommunityFileCache's array of real Files.
     */
    get real() {
        return this._real;
    }

    /**
     * @summary Gets the CommunityFileCache's array of fake files.
     *
     * @return {Array} The CommunityFileCache's array of fake Files.
     */
    get fake() {
        return this._fake;
    }

    /**
     * @summary Gets the CommunityFileCache's object of user uploaded files.
     *
     * @return {Object} The CommunityFileCache's object of arrays of Files of personal data. 
     * The keys of this object are user names and the values are arrays of Files for a user's uploaded files.
     */
    get personal() {
        return this._personal;
    }

    /**
     * @summary Returns a filtered version of the CommunityFileCache based on the access
     * level of the specified user.
     *
     * @param {User} user The user to use when filtering the CommunityFileCache.
     * @return {CommunityFileCache} A filtered CommunityFileCache containing only the files which
     * the specified user has access to.
     */
    filterCacheByUser(user) {
        var result = new CommunityFileCache();

        if (user == null) {
            if (this._fake) {
                result.fake = clone(this._fake);
            }
        } else if (user.accessLevel == 'admin') {
            if (this._real) {
                result.real = clone(this._real);
            }

            if (this._personal) {
                result.personal = clone(this._personal);
            }
        } else if (user.accessLevel == 1) {
            if (this._real) {
                result.real = clone(this._real);
            }

            if (this._personal[user.name] != null) {
                result.personal = {};
                result.personal[user.name] = clone(this._personal[user.name]);

            } else {
                result.personal = {};
                result.personal[user.name] = [];
            }
        }

        return result;
    }

    /**
     * @summary Returns a File based on the front-end file specified by the user.
     *
     * @param {Object} file The file specified by the user on the front end.
     * @param {User} user The user to use when obtaining the filtered CommunityFileCache.
     * @return {CommunityFileCache} A File matching the specified file for the given user. If
     * the specified file has an incorrect name or type, null is returned. If
     * the user doesn't exist or is trying to access a file they shouldn't be, null is returned.
     */
    matchFile(file, user) {
        var accessibleFiles = this.filterCacheByUser(user);

        if (file == null || file.name == null || file.type == null) {
            return null;
        }

        if (accessibleFiles[file.type] != null) {
            if (file.type == TYPES.personal) {
                for (var name in accessibleFiles[file.type]) {
                    if (accessibleFiles[file.type][name] == null ||
                        accessibleFiles[file.type][name].length == null) {
                        continue;
                    }

                    for (var i = 0; i < accessibleFiles[file.type][name].length; i++) {
                        if (accessibleFiles[file.type][name][i].name == file.name) {
                            return accessibleFiles[file.type][name][i];
                        }
                    }
                }
            } else {
                if (accessibleFiles[file.type] != null &&
                    accessibleFiles[file.type].length != null) {
                    for (var i = 0; i < accessibleFiles[file.type].length; i++) {
                        if (accessibleFiles[file.type][i].name == file.name) {
                            return accessibleFiles[file.type][i];
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * @summary Returns an object of arrays containing the the files
     * available to the specified user.
     *
     * @param {User} user The user to use when obtaining the filtered CommunityFileCache.
     * @return {Object} An array of community Files available to the given User.
     */
    getAccessibleFilesForUser(user) {
        var accessibleFiles = this.filterCacheByUser(user);
        var communities = [];
        var temp;

        for (var type in TYPES) {
            if (type == TYPES.personal) {
                temp = accessibleFiles.flattenPersonalFileArrays();
            } else {
                temp = accessibleFiles[type];
            }

            communities = communities.concat(temp);
        }

        communities = communities.map(function(file) {
            return file.toClientSide();
        });

        return communities;
    }

    /**
     * @summary Iterates through all of the personal arrays and aggregates
     *
     * @return {Array} An array of Files containing all used uploaded files.
     */
    flattenPersonalFileArrays() {
        var result = [];

        for (var name in this._personal) {
            result = result.concat(this._personal[name]);
        }

        return result;
    }
}

module.exports = {
    CommunityFileCache: CommunityFileCache,
    TYPES: TYPES
};
