'use strict'
/**
 * This file contains functions that help read, write, and delete files
 * and directories. There are also functions that maintain an in memory cache
 * of available matrix files for a given user based on their access level. 
 * 
 * @summary Methods for: reading, writing, deleting, and keeping track of Rdata files.
 */
const DEGREES_FILE_PREFIX = "degrees";

const fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var CommunityFileCache = require('./Models/communityFileCache').CommunityFileCache;
var FileGroup = require('./Models/fileGroup').FileGroup;
var File = require('./Models/fileModel').File;
var availableCommunitiesCache = null;

const TYPES = require('./Models/communityFileCache').TYPES;

var BASE_UPLOAD_DIRECTORY = 'R_Scripts/Communities/Uploaded/';
var BASE_PROPRIETARY_DIRECTORY = 'R_Scripts/Communities/Proprietary/';
var BASE_FAKE_DIRECTORY = 'R_Scripts/Communities/Fake/'

/**
 * @summary Updates the in-memory cache of avaialble files.
 */
function updateAvailableCommunitiesCache() {
    availableCommunitiesCache = createAvailableCommunitiesCache();

    console.log("%j", availableCommunitiesCache);
}

/**
 * @summary Returns an object containing the names of the files
 * avaialble for a user.
 *
 * @oaram {User} user The user that will be used to filter down the avaialble files based on 
 * that user's access level.
 * @return An array of Files available for the given User.
 */
function getAccessibleFilesForUser(user) {
    return availableCommunitiesCache.getAccessibleFilesForUser(user);
}

/**
 * @summary Returns an object that represents all of the existing communities files.
 *
 * @return An object whose keys are: real, fake, personal. This helps group files based on whether they are our 
 * proprietary data, fake data, or user uploaded data. 
 */
function createAvailableCommunitiesCache() {
    var result = new CommunityFileCache();

    
    result.real = getFilesInDirectory(BASE_PROPRIETARY_DIRECTORY, TYPES.real);
    result.fake = getFilesInDirectory(BASE_FAKE_DIRECTORY, TYPES.fake);


    var personalDirectories = fs.readdirSync(BASE_UPLOAD_DIRECTORY);

    for (var i = 0; i < personalDirectories.length; i++) {
        result.personal[personalDirectories[i]] = [];
            
        try {
            fs.accessSync(BASE_UPLOAD_DIRECTORY + personalDirectories[i], fs.R_OK);
            result.personal[personalDirectories[i]] = getFilesInDirectory(BASE_UPLOAD_DIRECTORY + personalDirectories[i], TYPES.personal);
        } catch (err) {
            console.log(err);
            createDirectory(BASE_UPLOAD_DIRECTORY, personalDirectories[i], null);
        }
    
    }

    return result;
}

/**
 * @summary Matches the front end file 
 * corresponding File from the available matrix cache.
 *
 * @param {Object} selectedFiles An object representing a front-end specified file.
 * @param {User} user The User for which to obtain the File.
 * @return {File} A File from the availableCommunitiesCache that matches the front-end file
 * specified in selectedFiles. 
 */
function getRequestedFile(selectedFile, user) {
    var file;

    if (selectedFile != null) {
        file = matchSelectedFile(selectedFile, availableCommunitiesCache, user);
    } 

    return file;
}

/**
 * @summary Reads the contents of a given directory
 * and created an array of Files based on the file names
 * found in the directory.
 *
 * @param {string} directory A path relative to server.js
 * @param {string} type One of the values in TYPES. This will
 * be added to every created File object.
 * @param {string} subType One of the values in SUB_TYPES. This will
 * be added to every created File object.
 * @return {Array} An array of Files representing the files found in the specified
 * directory. 
 */
function getFilesInDirectory(directory, type) {
    var filteredFileNames = null;
    var originalFilesNames = null;
    var fileList = null;

    originalFilesNames = fs.readdirSync(directory);

    filteredFileNames = originalFilesNames.filter(function(fileName) {
        if (fileName.indexOf('gitkeep') < 0) {
            return true;
        } else {
            return false;
        }
    });

    fileList = filteredFileNames.map(function(file) {
        return new File(file, directory + "/", type, null);
    });

    return fileList;
}

/**
 * @summary Returns a File from the availableCommunitiesCache based
 * on the fiven front-end file.
 *
 * @param {Object} file The front-end file specified.
 * @param {CommunityFileCache} cache A CommunityFileCache to match the specified file in.
 * @param {User} user The User for which to obtain the File.
 * @return {File} A File based on the front-end file specified for 
 * the given User.
 */
function matchSelectedFile(file, cache, user) {
    return cache.matchFile(file, user);
}

/**
 * @summary Removes a and its corresponding degrees file from the disk.
 *
 * @param {string} path The relative path to the file from server.js, not 
 * including the file name.
 * @param {string} file The name of the file to delete.
 * @param {function} callback A function to call when the files have been deleted.
 */
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
                }
            ],
            function(err, results) {
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

/**
 * @summary Writes a file to the disk in the directory
 * based on the concatentation of baseDirectory and userName.
 *
 * @param {string} baseDirectory A file path relative to server.js. This
 * will be combined with userName to form the directory where the file will
 * be saved.
 * @param {Object} file An object containing the name of a file and its associated data
 * encoded in Base64.
 * @param {string} userName The user name of the user that uploaded the file.
 * @param {string} subType The sub type of the file. This can take on one of the
 * values in SUB_TYPES.
 * @param {function} callback A function to call when the file is finished writing.
 */
function writeFile(baseDirectory, file, userName, callback) {
    fs.writeFile(baseDirectory + userName + "/" + file.name, file.data, 'base64', (err) => {
        if (err) {
            console.log(err);
            callback("Failed");
        } else {
            console.log("Wrote: " + file.name);
            callback();
        }
    });
}

/**
 * @summary Creates a directory, if it doesn't exist, with the path being baseDirectory,
 * userName, and subType concatenated in that order.
 *
 * @param {string} baseDirectory A file path relative to server.js. This will be combined 
 * with userName and subType to obtain the full path of the directory to be created.
 * @param {string} userName The name of the user for which to create the directory.
 * @param {string} subType The sub type of the directory.
 */
function createDirectory(baseDirectory, userName, callback) {
    mkdirp.sync(baseDirectory + userName, function(err) {
        if (err) {
            if (callback) {
                callback("Failed");
            }

            console.error(err)
        } else if (callback) {
            callback();
        }
    });
}

module.exports = {
    BASE_UPLOAD_DIRECTORY: BASE_UPLOAD_DIRECTORY,
    BASE_PROPRIETARY_DIRECTORY: BASE_PROPRIETARY_DIRECTORY,
    BASE_FAKE_DIRECTORY: BASE_FAKE_DIRECTORY,
    getRequestedFile: getRequestedFile,
    removeFile: removeFile,
    writeFile: writeFile,
    createDirectory: createDirectory,
    updateAvailableCommunitiesCache: updateAvailableCommunitiesCache,
    getAccessibleFilesForUser: getAccessibleFilesForUser
};
