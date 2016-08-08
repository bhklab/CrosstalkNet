'use strict'
var FileGroup = require('./fileGroup').FileGroup;
var clone = require('clone');

const TYPES = { real: "real", fake: "fake", personal: "personal" };
const SUB_TYPES = { normal: "normal", tumor: "tumor", delta: "delta" };

/** 
 * Class representing all available adjacency matrix Rdata files. 
 */
class MatrixFileCache {
    /**
     * @summary Create a file cache representing existing adjacency matrix Rdata files.
     *
     * @param {FileGroup} real The FileGroup containing all proprietary, public matrices.
     * @param {FileGroup} fake The FileGroup containing all fake matrices.
     * @param {Object} personal An object whose keys are user names and whose objects are
     * FileGroups for a specific user's uploaded files.
     */
    constructor(real, fake, personal) {
        if (!arguments.length) {
            this._real = new FileGroup();
            this._fake = new FileGroup();
            this._personal = {};
        } else {
            this._real = real;
            this._fake = fake;
            this._personal = personal;
        }
    }

    /**
     * @summary Sets the MatrixFileCache's real FileGroup.
     *
     * @param {FileGroup} real The new FileGroup for the MatrixFileCache's real FileGroup.
     */
    set real(real) {
        this._real = real;
    }

    /**
     * @summary Sets the MatrixFileCache's fake FileGroup.
     *
     * @param {FileGroup} real The new FileGroup for the MatrixFileCache's fake FileGroup.
     */
    set fake(fake) {
        this._fake = fake;
    }

    /**
     * @summary Sets the MatrixFileCache's personal object of FileGroups.
     *
     * @param {Object} personal The new object of FileGroups repersenting user uploaded files
     * for the MatrixFileCache. The keys of this object are user names and the values are FileGroups
     * for a user's uploaded files.
     */
    set personal(personal) {
        this._personal = personal;
    }

    /**
     * @summary Gets the MatrixFileCache's proprietary FileGroup.
     *
     * @return {FileGroup} The MatrixFileCache's proprietary FileGroup of real data.
     */
    get real() {
        return this._real;
    }

    /**
     * @summary Gets the MatrixFileCache's fake FileGroup.
     *
     * @return {FileGroup} The MatrixFileCache's FileGroup of fake data.
     */
    get fake() {
        return this._fake;
    }

    /**
     * @summary Gets the MatrixFileCache's object of  FileGroup.
     *
     * @return {Object} The MatrixFileCache's object of FileGroups of personal data. The keys of this object are
     * user names and the values are FileGroups for a user's uploaded files.
     */
    get personal() {
        return this._personal;
    }

    /**
     * @summary Returns a filtered version of the MatrixFileCache based on the access
     * level of the specified user.
     *
     * @param {User} user The user to use when filtering the MatrixFileCache.
     * @return {MatrixFileCache} A filtered MatrixFileCache containing only the files which
     * the specified user has access to.
     */
    filterCacheByUser(user) {
        var result = new MatrixFileCache();

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
                result.personal[user.name] = new FileGroup();
            }
        }

        return result;
    }

    /**
     * @summary Returns a File based on the front-end file specified by the user.
     *
     * @param {Object} file The file specified by the user on the front end.
     * @param {User} user The user to use when obtaining the filtered MatrixFileCache.
     * @return {MatrixFileCache} A File matching the specified file for the given user. If
     * the specified file has an incorrect name, type, or subType, null is returned. If
     * the user doesn't exist or is trying to access a file they shouldn't be, null is returned.
     */
    matchFile(file, user) {
        if (file == null || file.name == null || file.type == null || file.subType == null) {
            return null;
        }

        var accessibleFiles = this.filterCacheByUser(user);

        if (accessibleFiles[file.type] != null) {
            if (file.type == TYPES.personal) {
                for (var name in accessibleFiles[file.type]) {
                    if (accessibleFiles[file.type][name][file.subType] == null ||
                        accessibleFiles[file.type][name][file.subType].length == null) {
                        continue;
                    }

                    for (var i = 0; i < accessibleFiles[file.type][name][file.subType].length; i++) {
                        if (accessibleFiles[file.type][name][file.subType][i].name == file.name) {
                            return accessibleFiles[file.type][name][file.subType][i];
                        }
                    }
                }
            } else {
                if (accessibleFiles[file.type][file.subType] != null &&
                    accessibleFiles[file.type][file.subType].length != null) {
                    for (var i = 0; i < accessibleFiles[file.type][file.subType].length; i++) {
                        if (accessibleFiles[file.type][file.subType][i].name == file.name) {
                            return accessibleFiles[file.type][file.subType][i];
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
     * @param {User} user The user to use when obtaining the filtered MatrixFileCache.
     * @return {Object} An object whose keys are SUB_TYPES and whose corresponding values
     * are arrays containing the client side representation of the Files part of a sub type.
     */
    getAccessibleFilesForUser(user) {
        var accessibleFiles = this.filterCacheByUser(user);
        var matrices = { normal: [], tumor: [], delta: [] };
        var temp;

        for (var type in TYPES) {
            if (type == TYPES.personal) {
                temp = accessibleFiles.flattenPersonalFileGroups();
            } else {
                temp = accessibleFiles[type];
            }

            for (var subType in SUB_TYPES) {
                if (temp[subType] != null) {
                    matrices[subType] = matrices[subType].concat(temp[subType]);
                }
            }
        }

        for (var subType in SUB_TYPES) {
            matrices[subType] = matrices[subType].map(function(file) {
                return file.toClientSide();
            });
        }

        return matrices;
    }

    /**
     * @summary Iterates through all of the personal FileGroups and aggregates
     * their files into a single FileGroup.
     *
     * @return {FileGroup} A FileGroup containing all user uploaded files 
     */
    flattenPersonalFileGroups() {
        var result = new FileGroup();

        for (var name in this._personal) {
            for (var subType in SUB_TYPES) {
                result[subType] = result[subType].concat(this._personal[name][subType]);
            }
        }

        return result;
    }
}

module.exports = {
    MatrixFileCache: MatrixFileCache,
    SUB_TYPES: SUB_TYPES,
    TYPES: TYPES
};
