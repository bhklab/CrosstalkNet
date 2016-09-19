global.APP_BASE_DIRECTORY = __dirname + "/";
const fs = require('fs');

var async = require('async');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')

var authenticationUtils = require('./server-utils/authentication_utils');
var userCreationUtils = require('./server-utils/user_creation_utils');
var parseUtils = require('./server-utils/parse_utils');
var multiparty = require('connect-multiparty');
var jwt = require('jsonwebtoken');
var communityFileUtils = require('./server-utils/community_file_utils');
var matrixFileUtils = require('./server-utils/matrix_file_utils');
var handlerUtils = require("./server-utils/handler_utils");
var bcrypt = require('bcrypt');


var SECRET_KEY_ENC = 'j1cITlM3ACBNbDBOJ0roo2uwqGCk4QtoJ0sPXxnLNGeVwZlpzwScoPsEQKeHGQlfuDGgyke8FBPhGM3NkvmxYlWOPjp0VWhPCZTg58D1nkQ5t31Q3GDNjq5LUs2MlO3JFzuNsgJl9w6cLSu9ruyam2FTvaUlHIHs6shWyTb7kpSVSR0eHaOqOou0yuKMDsbqXuNMrlSr6pfGS98l0qvNtVSjcb1avIgTFts6ezrz96ZFTYeFU7N3jo6VUOUUaayO';

var app = express();

app.get('', function(req, res) {
    res.redirect('/app/#/documentation');
});

app.use('/app', express.static(__dirname + '/app'));

app.set('secretKey', SECRET_KEY_ENC);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.use(function(req, res, next) {
    if (req.body.token == null) {
        if (req.body.user == null) {
            res.send({ error: "Failed to authenticate." });
        } else {
            authenticationUtils.getUser(req.body.user.name,
                function(user) {
                    if (!user) {
                        res.json({ success: false, message: 'Authentication failed. User not found.' });
                    } else if (user) {
                        if (!bcrypt.compareSync(req.body.user.password, user.password)) {
                            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                        } else {
                            var token = jwt.sign({ user: Date.now() }, app.get('secretKey'), {
                                expiresIn: '168h' // expires in 7 days
                            });

                            authenticationUtils.addTokenToUser(user, token);

                            res.json({
                                success: true,
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
        jwt.verify(req.body.token, app.get('secretKey'), function(err, decoded) {
            if (err || authenticationUtils.getUserFromToken(req.body.token) == null) {
                console.log(err);
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                next();
            }
        });
    } else {
        console.log("Null token sent");
        return res.json({ success: false, message: 'Failed to authenticate token.' });
    }
});

app.post('/get-user-permission', handlerUtils.getUserPermission);

app.post('/login', function(req, res) {
    res.json({
        success: true,
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

// app.post('/community-explorer', handlerUtils.communityExplorer);

// app.post('/community-file-list', handlerUtils.communityFileList);

// app.post('/upload-community-file', handlerUtils.uploadCommunityFile);

// app.post('/delete-community-file', handlerUtils.deleteCommunityFile);

app.post('/create-new-users', handlerUtils.createNewUsers);

app.post('/get-all-user-names', handlerUtils.getAllUserNames);

app.post('/delete-users', handlerUtils.deleteUsers);

var server = app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config");

    // var salt = bcrypt.genSaltSync(3);
    // var password = bcrypt.hashSync('', salt);
    // console.log("password: " + password);

    matrixFileUtils.updateAvailableMatrixCache();
    communityFileUtils.updateAvailableCommunitiesCache();
    //createSampleUser();
});

server.timeout = 300000;
