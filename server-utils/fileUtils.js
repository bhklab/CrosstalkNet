'use strict'
const fs = require('fs');

function getRequestedFiles(req, availableMatrices, degree) {
    var result = { normal: null, tumor: null, delta: null, degree: null };
    var file = null;

    if (req == null || req.body == null || req.body.fileName == null) {
        return null;
    }

    if (req.body.selectedNetworkType == 'normal' && req.body.fileName.normal != null) {
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

function getFilesInDirectory(directory) {
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
            path: directory + "/"
        };
    });

    return fileList;
}

function matchSelectedFile(fileName, availableMatrices, accessLevel) {
    if (fileName == null) {
        return null;
    }

    var accessibleMatrices;
    accessLevel == 0 || accessLevel == null ? accessibleMatrices = availableMatrices.fake : accessibleMatrices = availableMatrices.real;

    for (var prop in accessibleMatrices) {
        for (var i = 0; i < accessibleMatrices[prop].length; i++) {
            if (accessibleMatrices[prop][i].fileName == fileName) {
                return accessibleMatrices[prop][i];
            }
        }
    }

    return null;
}


module.exports = {
    getRequestedFiles: getRequestedFiles,
    matchSelectedFile: matchSelectedFile,
    getFilesInDirectory: getFilesInDirectory
};
