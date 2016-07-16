'use strict'
const fs = require('fs');
var accessLevelDirectories = { '0': ['fake'], '1': ['real', 'personal'], 'admin': ['real', 'personal'] };
var async = require('async');
var mkdirp = require('mkdirp');

function getRequestedFiles(req, availableMatrices, degree, user) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (req == null || req.body == null || req.body.selectedFile == null) {
        return null;
    }

    if (req.body.selectedNetworkType == 'normal' && req.body.selectedFile.normal.name != null) {
        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrices, user);

        if (file != null) {
            result.normal = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (req.body.selectedNetworkType == 'tumor' && req.body.selectedFile.tumor != null) {
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrices, user);

        if (file != null) {
            result.tumor = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }
    } else if (req.body.selectedNetworkType == 'delta' && req.body.selectedFile.delta != null) {
        file = matchSelectedFile(req.body.selectedFile.delta, availableMatrices, user);

        if (file != null) {
            result.delta = file.path + file.name;
            result.degree = file.path + "degrees" + file.name;
        }

        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrices, user);
        result.normal = file.path + file.name;
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrices, user);
        result.tumor = file.path + file.name;

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
        if (fileName.indexOf('degree') < 0 && originalFilesNames.indexOf('degrees' + fileName) >= 0
            && fileName.indexOf('gitkeep') < 0) {
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
            pValue: "",
            path: directory + "/",
            type: type,
            subType: subType
        };
    });

    return fileList;
}

function matchSelectedFile(file, availableMatrices, user) {

    if (file == null || file.name == null || file.type == null || file.subType == null) {
        return null;
    }

    var accessibleMatrices = filterMatricesByAccessLevel(availableMatrices, user);
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

function filterMatricesByAccessLevel(availableMatrices, user) {
    var result = { real: { normal: [], tumor: [], delta: [] }, fake: { normal: [], tumor: [], delta: [] }, personal: { normal: [], tumor: [], delta: [] } };

    if (user != null) {
        if (user.accessLevel == 'admin') {
            if (availableMatrices.real) {
                result.real = availableMatrices.real;
            }

            for (var prop in availableMatrices.personal) {
                result.personal.normal = result.personal.normal.concat(availableMatrices.personal[prop].normal);
                result.personal.tumor = result.personal.tumor.concat(availableMatrices.personal[prop].tumor);
                result.personal.delta = result.personal.delta.concat(availableMatrices.personal[prop].delta);
            }
        } else if (user.accessLevel == 1) {
            result.real = availableMatrices.real;
            if (availableMatrices.personal[user.name] != null) {
                result.personal = availableMatrices.personal[user.name];

            } else {
                result.personal = { normal: [], tumor: [], delta: [] };
            }
        }
    } else {
        if (availableMatrices.fake) {
            result.fake = availableMatrices.fake;
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
    getRequestedFiles: getRequestedFiles,
    matchSelectedFile: matchSelectedFile,
    getFilesInDirectory: getFilesInDirectory,
    filterMatricesByAccessLevel: filterMatricesByAccessLevel,
    removeFile: removeFile,
    writeFile: writeFile,
    createDirectory: createDirectory
};
