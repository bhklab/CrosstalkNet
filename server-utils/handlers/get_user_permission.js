var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    if (user == null) {
        res.send({ permission: 0 });
    } else {
        var permission = user.accessLevel;
        res.send({ permission: permission });
    }
}

module.exports = {
	handler: handler
};