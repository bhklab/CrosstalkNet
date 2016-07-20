'use strict'
/**
 * This file contains functions that help read, write, and delete files
 * and directories. There are also functions that maintain an in memory cache
 * of available matrix files for a given user based on their access level. 
 * 
 * @summary Methods for: reading, writing, deleting, and keeping track of Rdata files.
 */

const TYPES = { real: "real", fake: "fake", personal: "personal" };
const SUB_TYPES = { normal: "normal", tumor: "tumor", delta: "delta" };

const fs = require('fs');
var accessLevelDirectories = { '0': ['fake'], '1': ['real', 'personal'], 'admin': ['real', 'personal'] };
var async = require('async');
var mkdirp = require('mkdirp');
var FileCache = require('./fileCache').FileCache;
var FileGroup = require('./fileGroup').FileGroup;
var File = require('./fileModel').File;
var availableMatrixCache = null;

var BASE_UPLOAD_DIRECTORY = 'R_Scripts/Uploaded_Matrices/';
var BASE_PROPRIETARY_DIRECTORY = 'R_Scripts/Proprietary_Matrices/';
var BASE_FAKE_DIRECTORY = 'R_Scripts/Fake_Matrices/'

/**
 * @summary Updates the in-memory cache of avaialble files.
 */
function updateAvailableMatrixCache() {
    availableMatrixCache = createavailableMatrixCache();
}

/**
 * @summary Returns an object containing the names of the files
 * avaialble for a user.
 *
 * @param {Array} subTypes An array of strings representing the subtype of a file. Subtypes are
 * normal, tumor, or delta.
 * @oaram {User} user The user that will be used to filter down the avaialble files based on 
 * that user's access level.
 * @return An object whose keys can be: normal, tumor, and delta. The values are arrays containing the
 * the file names of files avaialble for the specified user.
 */
function getAccessibleMatricesForUser(user) {
    return availableMatrixCache.getAccessibleMatricesForUser(user);
}

/**
 * @summary Returns an object that represents all of the existing matrix files.
 *
 * @return An object whose keys are: real, fake, personal. This helps group files based on whether they are our 
 * proprietary data, fake data, or user uploaded data. The values are objects 
 */
function createavailableMatrixCache() {
    var result = new FileCache();

    for (var subType in SUB_TYPES) {
        result.real[SUB_TYPES[subType]] = getFilesInDirectory(BASE_PROPRIETARY_DIRECTORY + SUB_TYPES[subType], TYPES.real, SUB_TYPES[subType]);
        result.fake[SUB_TYPES[subType]] = getFilesInDirectory(BASE_FAKE_DIRECTORY + SUB_TYPES[subType], TYPES.fake, SUB_TYPES[subType]);
    }

    var personalDirectories = fs.readdirSync(BASE_UPLOAD_DIRECTORY);

    for (var i = 0; i < personalDirectories.length; i++) {
        result.personal[personalDirectories[i]] = new FileGroup();

        for (var subType in SUB_TYPES) {
            try {
                fs.accessSync(BASE_UPLOAD_DIRECTORY + personalDirectories[i] + "/" + SUB_TYPES[subType], fs.R_OK);
                result.personal[personalDirectories[i]][SUB_TYPES[subType]] = getFilesInDirectory(BASE_UPLOAD_DIRECTORY + personalDirectories[i] + "/" + SUB_TYPES[subType], TYPES.personal, SUB_TYPES[subType]);
            } catch (err) {
                console.log(err);
                createDirectory(BASE_UPLOAD_DIRECTORY, personalDirectories[i], SUB_TYPES[subType], null);
            }
        }
    }

    return result;
}

/**
 * @summary Matches the front end file in the
 * selected files that is not null and returns the
 * corresponding File from the available matrix cache.
 *
 * @param {Object} selectedFiles An object whose keys are TYPES and whose
 * values are a front-end specified file.
 * @param {User} user The User for which to obtain the File.
 * @return {File} A File from the availableMatrixCache that matches the front-end file
 * specified in selectedFiles. 
 */
function getRequestedFile(selectedFiles, user) {
    var file;

    if (selectedFiles.delta != null) {
        file = matchSelectedFile(selectedFiles.delta, availableMatrixCache, user);
    } else if (selectedFiles.normal != null) {
        file = matchSelectedFile(selectedFiles.normal, availableMatrixCache, user);
    } else if (selectedFiles.tumor != null) {
        file = matchSelectedFile(selectedFiles.tumor, availableMatrixCache, user);
    } else if (selectedFiles.arbitrary != null) {
        file = matchSelectedFile(selectedFiles.arbitrary, availableMatrixCache, user);
    }

    return file;
}

/**
 * @summary Matches the front ends files in selected files and returns
 * the corresponding Files from the availableMatrixCache.
 *
 * @param {Oject} selectedFiles An object whose keys are TYPES and whose
 * values are a front-end specified files.
 * @param {string} selectedNetworkType A string that should be one of the values
 * in TYPES. This specifies what type of network the request, and the function 
 * uses this in order to determine the right number of files to return.
 * @param {User} user The User for which to obtain the Files. 
 *
 *
 *
 *
 */
function getRequestedFiles(selectedFiles, selectedNetworkType, user) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (selectedFiles == null) {
        return null;
    }

    if (selectedNetworkType == 'normal' && selectedFiles.normal.name != null) {
        file = matchSelectedFile(selectedFiles.normal, availableMatrixCache, user);

        if (file != null) {
            result.normal = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (selectedNetworkType == 'tumor' && selectedFiles.tumor != null) {
        file = matchSelectedFile(selectedFiles.tumor, availableMatrixCache, user);

        if (file != null) {
            result.tumor = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (selectedNetworkType == 'delta' && selectedFiles.delta != null) {
        file = matchSelectedFile(selectedFiles.delta, availableMatrixCache, user);

        if (file != null) {
            result.delta = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }

        file = matchSelectedFile(selectedFiles.normal, availableMatrixCache, user);
        if (file != null) {
            result.normal = file.path + file.name;
        }
        file = matchSelectedFile(selectedFiles.tumor, availableMatrixCache, user);
        if (file != null) {
            result.tumor = file.path + file.name;
        }

        if (result.tumor == null || result.normal == null) {
            return null;
        }
    } else {
        return null;
    }

    return result;
}

function getFilesInDirectory(directory, type, subType) {
    var filteredFileNames = null;
    var originalFilesNames = null;
    var fileList = null;

    originalFilesNames = fs.readdirSync(directory);

    filteredFileNames = originalFilesNames.filter(function(fileName) {
        if (fileName.indexOf('degree') < 0 && originalFilesNames.indexOf('degrees' + fileName) >= 0 && fileName.indexOf('gitkeep') < 0) {
            return true;
        } else {
            return false;
        }
    });

    console.log("type: " + type + " subType: " + subType);
    console.log(filteredFileNames);

    fileList = filteredFileNames.map(function(file) {
        return new File(file, directory + "/", type, subType);
    });

    return fileList;
}

function matchSelectedFile(file, matrices, user) {
    return matrices.matchFile(file, user);
}

function removeFile(path, file, callback) {
    var error = false;
    if (path != null && file != null) {

        async.series([
                function(cbInner) {

                    fs.unlink(path + file.name, function(err) {
                        if (err) {
                            console.log(err);
                            cbInner(null, "Failed1");
                        } else {
                            cbInner();
                        }
                    });
                },
                function(cbInner) {
                    fs.unlink(path + 'degrees' + file.name, function(err) {
                        if (err) {
                            console.log(err);
                            cbInner(null, "Failed2");
                        } else {
                            cbInner();
                        }
                    });
                }
            ],
            function(err, results) {
                // console.log("results in fileUtils.js: %j", results);
                // console.log("err: %j", err);

                if (results != null && results.length > 0 && (results[0] != null || results[1] != null) || err != null) {
                    if (callback) {
                        callback(null, "Failed");
                    }
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
    }
}

function writeFile(baseDirectory, file, userName, type, callback) {
    console.log("baseDirectory: " + baseDirectory);
    fs.writeFile(baseDirectory + userName + "/" + type + "/" + file.name, file.data, 'base64', (err) => {
        if (err) {
            console.log(err);
            callback("Failed");
        } else {
            console.log("Wrote: " + file.name);
            callback();
        }
    });
}

function createDirectory(baseDirectory, userName, type, callback) {
    mkdirp.sync(baseDirectory + userName + "/" + type, function(err) {
        if (err) {
            if (callback) {
                callback("Failed");
            }

            console.error(err)
        } else {
            console.log('pow!')
        }
    });
}

module.exports = {
    BASE_UPLOAD_DIRECTORY: BASE_UPLOAD_DIRECTORY,
    BASE_PROPRIETARY_DIRECTORY: BASE_PROPRIETARY_DIRECTORY,
    BASE_FAKE_DIRECTORY: BASE_FAKE_DIRECTORY,
    getRequestedFile: getRequestedFile,
    getRequestedFiles: getRequestedFiles,
    getFilesInDirectory: getFilesInDirectory,
    removeFile: removeFile,
    writeFile: writeFile,
    createDirectory: createDirectory,
    updateAvailableMatrixCache: updateAvailableMatrixCache,
    getAccessibleMatricesForUser: getAccessibleMatricesForUser,
    createavailableMatrixCache: createavailableMatrixCache
};
