'use strict'
const fs = require('fs');
var accessLevelDirectories = { '0': ['fake'], '1': ['real', 'personal'], 'admin': ['real', 'personal'] };

function getRequestedFiles(req, availableMatrices, degree, user) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (req == null || req.body == null || req.body.selectedFile == null) {
        return null;
    }

    if (req.body.selectedNetworkType == 'normal' && req.body.selectedFile.normal.name != null) {
        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrices, user);

        if (file != null) {
            result.normal = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }
    } else if (req.body.selectedNetworkType == 'tumor' && req.body.selectedFile.tumor != null) {
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrices, user);

        if (file != null) {
            result.tumor = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }
    } else if (req.body.selectedNetworkType == 'delta' && req.body.selectedFile.delta != null) {
        file = matchSelectedFile(req.body.selectedFile.delta, availableMatrices, user);

        if (file != null) {
            result.delta = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }

        file = matchSelectedFile(req.body.selectedFile.normal, availableMatrices, user);
        result.normal = file.path + file.fileName;
        file = matchSelectedFile(req.body.selectedFile.tumor, availableMatrices, user);
        result.tumor = file.path + file.fileName;

        if (result.tumor == null || result.normal == null) {
            return null;
        }
    } else {
        return null;
    }

    for (var prop in result) {
        var val = null;

        if (result[prop] != null) {
            if (!degree) {
                continue;
            }

            val = fs.accessSync(result[prop], fs.R_OK, function(err) {
                if (err) {
                    return { error: prop + " file does not exist!" };
                } else {
                    return null;
                }
            });
        }

        if (val != null) {
            return vall;
        }
    }

    return result;
}

function getFilesInDirectory(directory, type, subType) {
    var fileNames = null;
    var fileList = null;

    fileNames = fs.readdirSync(directory);

    fileNames = fileNames.filter(function(fileName) {
        return fileName.indexOf('degree') < 0 && fileName.indexOf('gitkeep') < 0;
    });

    if (type == 'personal') {
        console.log(fileNames);
    }

    fileList = fileNames.map(function(file) {
        return {
            fileName: file,
            pValue: "",
            path: directory + "/",
            type: type,
            subType: subType
        };
    });

    return fileList;
}

function matchSelectedFile(file, availableMatrices, user) {
    console.log("file " + file);
    console.log(file.name);
    console.log(file.type);
    console.log(file.subType);
    if (file == null || file.name == null || file.type == null || file.subType == null) {
        return null;
    }

    var accessibleMatrices = filterMatricesByAccessLevel(availableMatrices, user);

    if (accessibleMatrices[file.type] != null && accessibleMatrices[file.type][file.subType] != null) {
        for (var i = 0; i < accessibleMatrices[file.type][file.subType].length; i++) {
            if (accessibleMatrices[file.type][file.subType][i].fileName == file.name) {
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
            result.real = availableMatrices.real;

            for (var prop in availableMatrices.personal) {
                result.personal.normal = availableMatrices.personal[prop].normal;
                result.personal.tumor = availableMatrices.personal[prop].tumor;
                result.personal.delta = availableMatrices.personal[prop].delta;
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
        result.fake = availableMatrices.fake;
    }

    return result;
}

function removeFile(path, file) {
    console.log(path);
    console.log(file);
    if (path != null && file != null) {
        fs.unlink(path + file.name, function(err) {
            console.log(err);
        });
        fs.unlink(path + 'degrees' + file.name, function(err) {
            console.log(err);
        });
    }
}

function writeFile(file, type, user, callback) {
    fs.writeFile('R_Scripts/Uploaded_Matrices/' + user.name + "/" + type + "/" + file.name, file.data, 'base64', (err) => {
        if (err) {
            console.log(err);
        }

        console.log("Wrote: " + file.name);
        callback();
    });
}


module.exports = {
    getRequestedFiles: getRequestedFiles,
    matchSelectedFile: matchSelectedFile,
    getFilesInDirectory: getFilesInDirectory,
    filterMatricesByAccessLevel: filterMatricesByAccessLevel,
    removeFile: removeFile,
    writeFile: writeFile
};
