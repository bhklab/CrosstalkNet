'use strict'
const fs = require('fs');
var accessLevelDirectories = { '0': ['fake'], '1': ['real', 'personal'], 'admin': ['real', 'personal'] };

function getRequestedFiles(req, availableMatrices, degree) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (req == null || req.body == null || req.body.file == null) {
        return null;
    }

    if (req.body.selectedNetworkType == 'normal' && req.body.file.normal.name != null) {
        file = matchSelectedFile(req.body.fileName.normal, availableMatrices, req.accessLevel);

        if (file != null) {
            result.normal = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }
    } else if (req.body.selectedNetworkType == 'tumor' && req.body.fileName.tumor != null) {
        file = matchSelectedFile(req.body.fileName.tumor, availableMatrices, req.accessLevel);

        if (file != null) {
            result.tumor = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }
    } else if (req.body.selectedNetworkType == 'delta' && req.body.fileName.delta != null) {
        file = matchSelectedFile(req.body.fileName.delta, availableMatrices, req.accessLevel);

        if (file != null) {
            result.delta = file.path + file.fileName;
            result.degree = file.path + "degrees" + file.fileName;
        }

        file = matchSelectedFile(req.body.fileName.normal, availableMatrices, req.accessLevel);
        result.normal = file.path + file.fileName;
        file = matchSelectedFile(req.body.fileName.tumor, availableMatrices, req.accessLevel);
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
    if (file == null || file.fileName == null || file.type == null || file.subType == null) {
        return null;
    }

    var accessibleMatrices = filterMatricesByAccessLevel(availableMatrices, user);


    accessLevel == 0 || accessLevel == null ? accessibleMatrices = availableMatrices.fake : accessibleMatrices = availableMatrices.real;

    for (var type in accessibleMatrices) {
        for (var subType in accessibleMatrices[type]) {
            for (var i = 0; i < accessibleMatrices[type][subType].length; i++) {
                if (accessibleMatrices[type][subType][i].fileName == fileName) {
                    return accessibleMatrices[type][subType][i];
                }
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

            result.personal = availableMatrices.personal;
        } else if (user.accessLevel == 1) {
            result.real = availableMatrices.real;
            result.personal = availableMatrices.personal[user.name];
        }
    } else {
        result.fake = availableMatrices.fake;
    }

    return result;
}


module.exports = {
    getRequestedFiles: getRequestedFiles,
    matchSelectedFile: matchSelectedFile,
    getFilesInDirectory: getFilesInDirectory
};
