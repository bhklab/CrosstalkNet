global.APP_BASE_DIRECTORY = __dirname + '/';
require('dotenv').config();
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var authenticationUtils = require('./server-utils/authentication_utils');
var jwt = require('jsonwebtoken');
var communityFileUtils = require('./server-utils/community_file_utils');
var matrixFileUtils = require('./server-utils/matrix_file_utils');
var handlerUtils = require('./server-utils/handler_utils');
var bcrypt = require('bcryptjs');

var key = process.env.SECRET_KEY_ENC;
var app = express();

app.get('', function (req, res) {
	res.redirect('/app/#/documentation');
});

app.use('/app', express.static(__dirname + '/app'));

app.set('secretKey', key);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.use(function (req, res, next) {
	if (req.body.token == null && req.body.token != 'guest') {
		if (req.body.user == null) {
			res.send({ error: 'Failed to authenticate. Please try logging in again.' });
		} else {
			authenticationUtils.getUser(req.body.user.name,
				function (user) {
					if (!user) {
						res.json({ login: false, message: 'Authentication failed. User not found.' });
					} else if (user) {
						if (!bcrypt.compareSync(req.body.user.password, user.password)) {
							res.json({ login: false, message: 'Authentication failed. Wrong password.' });
						} else {
							var token = jwt.sign({ user: Date.now() }, app.get('secretKey'), {
								expiresIn: '168h'
							});

							authenticationUtils.addTokenToUser(user, token);

							res.json({
								login: true,
								message: 'Enjoy your token!',
								token: token
							});
						}
					}
				});
		}
	} else if (req.body.token == 'guest') {
		next();
	} else if (req.body.token != null) {
		jwt.verify(req.body.token, app.get('secretKey'), function (err, decoded) {
			if (err || authenticationUtils.getUserFromToken(req.body.token) == null) {
				var message = '';

				console.log(err);
				if (err && err.expiredAt != null) {
					message = 'Failed to authenticate token. Expired: ' + err.expiredAt + '. Please try logging in again.';
				} else {
					message = 'Failed to authenticate token. Please try logging in again.';
				}

				return res.json({ login: false, message: message });
			} else {
				next();
			}
		});
	} else {
		console.log('Null token sent');
		return res.json({ login: false, message: 'Failed to authenticate token. Please try logging in again.' });
	}
});

app.post('/get-user-permission', handlerUtils.getUserPermission);

app.post('/login', function (req, res) {
	res.json({
		login: true,
		message: 'Token Validated!'
	});
});

app.post('/gene-list', handlerUtils.geneList);

app.post('/min-degree-genes', handlerUtils.minDegreeGenes);

app.post('/interaction-explorer', handlerUtils.interactionExplorer);

app.post('/main-graph', handlerUtils.mainGraph);

app.post('/get-all-paths', handlerUtils.getAllPaths);

app.post('/available-matrices', handlerUtils.availableMatrices);

app.post('/overall-matrix-stats', handlerUtils.overallMatrixStats);

app.post('/delete-matrix-file', handlerUtils.deleteMatrixFile);

app.post('/upload-matrices', handlerUtils.uploadMatrices);

app.post('/community-explorer', handlerUtils.communityExplorer);

app.post('/community-file-list', handlerUtils.communityFileList);

app.post('/upload-community-file', handlerUtils.uploadCommunityFile);

app.post('/delete-community-file', handlerUtils.deleteCommunityFile);

app.post('/create-new-users', handlerUtils.createNewUsers);

app.post('/get-all-user-names', handlerUtils.getAllUserNames);

app.post('/delete-users', handlerUtils.deleteUsers);

var server = app.listen(5000, function () {
	console.log('Listening on port 5000');
	console.log('Initializing data and config');
	matrixFileUtils.updateAvailableMatrixCache();
	communityFileUtils.updateAvailableCommunitiesCache();
});

server.timeout = 300000;