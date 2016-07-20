'use strict'
/**
 * This file contains functions that help read, write, and delete files
 * and directories. There are also functions that maintain an in memory cache
 * of available matrix files for a given user based on their access level. 
 * 
 * @summary Methods for: reading, writing, deleting, and keeping track of Rdata files.
 */

const fs = require('fs');
var accessLevelDirectories = { '0': ['fake'], '1': ['real', 'personal'], 'admin': ['real', 'personal'] };
var async = require('async');
var mkdirp = require('mkdirp');
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
function getAccessibleMatricesForUser(subTypes, user) {
    var accessibleMatrices = filterMatricesByAccessLevel(availableMatrixCache, user);
    var matrices = {};

    for (var type in accessibleMatrices) {
        for (var i = 0; i < subTypes.length; i++) {
            if (Object.keys(accessibleMatrices[type]).indexOf(subTypes[i]) >= 0 && accessibleMatrices[type][subTypes[i]] != null) {
                if (matrices[subTypes[i]] == null) {
                    matrices[subTypes[i]] = accessibleMatrices[type][subTypes[i]];
                } else {
                    matrices[subTypes[i]] = matrices[subTypes[i]].concat(accessibleMatrices[type][subTypes[i]]);
                }
            }
        }
    }

    for (var i = 0; i < subTypes.length; i++) {
        matrices[subTypes[i]] = matrices[subTypes[i]].map(function(file) {
            return {
                name: file.name,
                type: file.type,
                subType: file.subType
            };
        });
    }

    return matrices;
}

/**
 * @summary Returns an object that represents all of the existing matrix files.
 *
 * @return An object whose keys are: real, fake, personal. This helps group files based on whether they are our 
 * proprietary data, fake data, or user uploaded data. The values are objects 
 */
function createavailableMatrixCache() {
    var fileList = [];
    var result = { real: { normal: [], tumor: [], delta: [] }, fake: { normal: [], tumor: [], delta: [] }, personal: {} };

    var directories = ['normal', 'tumor', 'delta'];

    for (var i = 0; i < directories.length; i++) {
        result.real[directories[i]] = getFilesInDirectory(BASE_PROPRIETARY_DIRECTORY + directories[i], 'real', directories[i]);
        result.fake[directories[i]] = getFilesInDirectory(BASE_FAKE_DIRECTORY + directories[i], 'fake', directories[i]);
    }

    var personalDirectories = fs.readdirSync(BASE_UPLOAD_DIRECTORY);
    for (var i = 0; i < personalDirectories.length; i++) {
        result.personal[personalDirectories[i]] = { normal: [], tumor: [], delta: [] };
        for (var j = 0; j < directories.length; j++) {
            try {
                fs.accessSync(BASE_UPLOAD_DIRECTORY + personalDirectories[i] + "/" + directories[j], fs.R_OK);
                result.personal[personalDirectories[i]][directories[j]] = getFilesInDirectory(BASE_UPLOAD_DIRECTORY + personalDirectories[i] + "/" + directories[j], 'personal', directories[j]);

            } catch (err) {
                console.log(err);
                createDirectory(BASE_UPLOAD_DIRECTORY, personalDirectories[i], directories[j], null);
            }
        }
    }

    return result;
}


function getRequestedFile(selectedFiles, user, filter) {
    var matrices;
    var file;

    if (filter == null) {
        matrices = availableMatrixCache;
    } else if (Object.keys(availableMatrixCache).indexOf(filter) >= 0) {
        matrices = { personal: availableMatrixCache.personal };
    } else {
        return null;
    }

    if (selectedFiles.delta != null) {
        file = matchSelectedFile(selectedFiles.delta, matrices, user);
    } else if (selectedFiles.normal != null) {
        file = matchSelectedFile(selectedFiles.normal, matrices, user);
    } else if (selectedFiles.tumor != null) {
        file = matchSelectedFile(selectedFiles.tumor, matrices, user);
    } else if (selectedFiles.arbitrary != null) {
        file = matchSelectedFile(selectedFiles.arbitrary, matrices, user);
    }

    return file;
}

function getRequestedFiles(req, degree, user) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (req == null || req.body == null || req.body.selectedFile == null) {
        return null;
    }

    if (req.body.selectedNetworkType == 'normal' && req.body.selectedFile.normal.name != null) {
        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrixCache, user);

        if (file != null) {
            result.normal = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (req.body.selectedNetworkType == 'tumor' && req.body.selectedFile.tumor != null) {
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrixCache, user);

        if (file != null) {
            result.tumor = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (req.body.selectedNetworkType == 'delta' && req.body.selectedFile.delta != null) {
        file = matchSelectedFile(req.body.selectedFile.delta, availableMatrixCache, user);

        if (file != null) {
            result.delta = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }

        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrixCache, user);
        if (file != null) {
            result.normal = file.path + file.name;
        }
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrixCache, user);
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

    if (type == 'personal') {
        console.log(filteredFileNames);
    }

    fileList = filteredFileNames.map(function(file) {
        return {
            name: file,
            path: directory + "/",
            type: type,
            subType: subType
        };
    });

    return fileList;
}

function matchSelectedFile(file, matrices, user) {
    if (file == null || file.name == null || file.type == null || file.subType == null) {
        return null;
    }

    var accessibleMatrices = filterMatricesByAccessLevel(matrices, user);
    // console.log("accessibleMatrices: %j", accessibleMatrices);

    // console.log(file.name);
    // console.log(file.type);
    // console.log(file.subType);

    if (accessibleMatrices[file.type] != null && accessibleMatrices[file.type][file.subType] != null) {
        for (var i = 0; i < accessibleMatrices[file.type][file.subType].length; i++) {
            if (accessibleMatrices[file.type][file.subType][i].name == file.name) {
                return accessibleMatrices[file.type][file.subType][i];
            }
        }
    }

    return null;
}

function filterMatricesByAccessLevel(matrices, user) {
    var result = { real: { normal: [], tumor: [], delta: [] }, fake: { normal: [], tumor: [], delta: [] }, personal: { normal: [], tumor: [], delta: [] } };

    if (user != null) {
        if (user.accessLevel == 'admin') {
            if (matrices.real) {
                result.real = matrices.real;
            }

            for (var prop in matrices.personal) {
                result.personal.normal = result.personal.normal.concat(matrices.personal[prop].normal);
                result.personal.tumor = result.personal.tumor.concat(matrices.personal[prop].tumor);
                result.personal.delta = result.personal.delta.concat(matrices.personal[prop].delta);
            }
        } else if (user.accessLevel == 1) {
            result.real = matrices.real;
            if (matrices.personal[user.name] != null) {
                result.personal = matrices.personal[user.name];

            } else {
                result.personal = { normal: [], tumor: [], delta: [] };
            }
        }
    } else {
        if (matrices.fake) {
            result.fake = matrices.fake;
        }
    }

    return result;
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
    matchSelectedFile: matchSelectedFile,
    getFilesInDirectory: getFilesInDirectory,
    filterMatricesByAccessLevel: filterMatricesByAccessLevel,
    removeFile: removeFile,
    writeFile: writeFile,
    createDirectory: createDirectory,
    updateAvailableMatrixCache: updateAvailableMatrixCache,
    getAccessibleMatricesForUser: getAccessibleMatricesForUser,
    createavailableMatrixCache: createavailableMatrixCache
};
