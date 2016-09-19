var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);

    if (user.accessLevel != 'admin') {
        res.send({ error: "Not authorized to view users" });
        return;
    }

    var users = authenticationUtils.getAllUserNames();

    res.send({ users: users });

}

module.exports = {
	handler: handler
};