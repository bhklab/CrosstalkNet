var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + 'server-utils/matrix_file_utils');

function handler(req, res) {
    var subTypes = req.body.types;
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var accessibleMatrices = matrixFileUtils.getAccessibleFilesForUser(user);

    res.send({ fileList: accessibleMatrices });
}

module.exports = {
	handler: handler
};