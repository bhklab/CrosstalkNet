'use strict'

var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var communityFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/community_file_utils');
var geneUtils = require(APP_BASE_DIRECTORY + '/server-utils/gene_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var accessibleFiles = communityFileUtils.getAccessibleFilesForUser(user);

    res.send({ fileList: accessibleFiles });
}

module.exports = {
    handler: handler
};
