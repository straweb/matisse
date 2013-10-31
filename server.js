/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    settings = require('./settings.js'),
    routes = require('./routes'),
    appName = settings.appName,
    UserProvider = require('./server/api/userprovider').UserProvider,
    BoardProvider = require('./server/api/boardprovider').BoardProvider,
    ShapesProvider = require('./server/api/shapesprovider').ShapesProvider,
    serverPort = settings.serverPort;
var LogToFile = require("./server/logToFile");

var app = express(),
    io = require('socket.io').listen(app);
// all environments
app.set('port', process.env.PORT || serverPort);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

var baseDir = __dirname + '/client/';

// development only
if ('production' == app.get('env')) {
    app.use(express.static(path.join(__dirname, 'dist')));
} else {
    app.use(express.static(path.join(__dirname, 'client')));
    app.use(express.errorHandler());
}

app.get('/', function (request, response) {
    response.sendfile(baseDir + 'index.html');
});

app.post('/logout', function (request, response) {
    logout(request);
    response.clearCookie('auth');
    response.end();
});

function logout(request) {
    var cookies = {}, sessionId = undefined;
    request.headers.cookie && request.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        console.log(parts[1].trim().toString());
        if (parts[0] == "auth") {
            sessionId = decodeURIComponent(parts[1]);
            userProvider.findBySessionId(sessionId, function (error, result) {
                if (result && result.hasOwnProperty('sessionId') && result['sessionId']) {
                    result['sessionId'] = '';
                    userProvider.update(result['_id'].toString(), result, function (error, result) {

                    });
                    return true;
                } else {
                    return false;
                }
            });
        }
    });
}

function getRandomString(string_length) {
    var chars = "0123456789abcdefghiklmnopqrstuvwxyz", randomstring = '';
    string_length = (string_length && string_length != NaN) ? string_length : 8;
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function getUserData(userObj, response) {
    var sharedBoard = [], ownedBoard = [];
    boardProvider.findByEmail(userObj['email'], function (error, docs) {
        if (error) {
            response.send(401, {error: "Unable to fetch user data", serverMsg: error});
        } else {
            Object.keys(docs).forEach(function (key) {
                if (docs[key]['sharedUrl'] && docs[key]['sharedUrl'] != "") {
                    sharedBoard.push(docs[key]);
                } else {
                    ownedBoard.push(docs[key]);
                }
            });
            response.cookie('auth', userObj['sessionId'], { maxAge: 5 * 60 * 1000, httpOnly: true });      //maxAge in milliseconds
            response.send('200', {
                success: "Login Successful",
                email: userObj['email'],
                user: userObj['user'],
                sharedBoards: sharedBoard,
                ownedBoards: ownedBoard,
                createdNum: ownedBoard.length,
                sharedNum: sharedBoard.length
            });
        }
    });
}

app.post('/authenticate', function (request, response) {
    var email = request.param('email'), password = request.param('password');
    if (email && email != '' && password != '') {
        userProvider.createSessionByEmailId(email, password, function (error, user) {
            if (user && user.hasOwnProperty('email') && user['email'] != '') {
                getUserData(user, response);
            } else {
                response.clearCookie('auth');
                response.send(401, {error: error});
            }
        });
    } else {
        var cookies = {}, sessionId = undefined;
        request.headers.cookie && request.headers.cookie.split(';').forEach(function (cookie) {
            var parts = cookie.split('=');
            cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
            console.log(parts[1].trim().toString());
            if (parts[0] == "auth") {
                sessionId = decodeURIComponent(parts[1]);
                userProvider.findBySessionId(sessionId, function (error, result) {
                    if (result && result.hasOwnProperty('email') && result['email'] && result['password'] != '') {
                        getUserData(result, response);
                    } else {
                        response.send(401, {error: "Session expired please re login", serverMsg: error});
                    }
                });
            }
        });
    }
});

var boardProvider = new BoardProvider('localhost', 27017);
var shpaesProvider = new ShapesProvider('localhost', 27017);

app.get('/board/:id', function (req, response) {
    response.sendfile(baseDir + './board/index.html');

    /*  boardProvider.save({
     email:req.param('email'),
     createdUrl:null,
     sharedUrl:req.param('_id')
     }, function (error, docs) {
     Object.keys(docs).forEach(function (key) {
     console.log("test: " + key, docs[key]);
     });

     if (docs && docs.hasOwnProperty('email') && docs['email']) {
     response.send('200', {
     success:"Shared Successful",
     user:docs['user'],
     createdUrl:docs['createdUrl'],
     sharedUrl:docs['sharedUrl']
     });
     } else {
     response.send(401, {error:"unable to Share whiteboard for the username " + req.param('email'), serverMsg: error});
     }

     });*/
});
app.post('/boards/new', function (req, response) {
    if (req.param('email') != undefined) {
        var url = getRandomString(8);
        boardProvider.save({
            email: req.param('email'),
            createdUrl: url,
            sharedUrl: null,
            name: req.param('boardName')
        }, function (error, docs) {
            Object.keys(docs).forEach(function (key) {
                console.log("test: " + key, docs[key]);
            });
            if (error) {
                response.send(401, {error: "unable to create whiteboard for the username " + req.param('email'), serverMsg: error});
            } else {
//                response.redirect('board/' + url);
                response.send('200', {
                    success: "Created new WhiteBoard Successfully",
                    board: docs[0]
                    /*email:docs['email'],
                     createdUrl:docs['createdUrl'],
                     sharedUrl:docs['sharedUrl'],
                     name:docs['name']*/
                });
            }
        });
    }
});
app.post('/boards/update', function (req, response) {
//    if (req.param('email') != undefined) {
    boardProvider.update(req.param('_id'), {
        email: req.param('email'),
        createdUrl: req.param('createdUrl'),
        created_at: req.param('created_at'),
        sharedUrl: null,
        name: req.param('boardName')

    }, function (error, board) {
        if (error) {
            response.send(401, {error: " Unable to update whiteboard for the username " + req.param('email'), serverMsg: error});
        } else {
            response.send('200', {
                success: "Created Successful",
//                email: board['email'],
                createdUrl: board['createdUrl'],
                sharedUrl: board['sharedUrl'],
                boardName: board['name']
            });
        }

    });
//    }
});
app.post('/boards/delete', function (req, response) {
//    if (req.param('email') != undefined) {
    boardProvider.delete(req.param('_id'), function (error, board) {
        if (error) {
            response.send(401, {error: " Unable to delete whiteboard for the username " + req.param('email'), serverMsg: error});
        } else {
            response.send('200', {
                success: "Deleted Successful",
                board: req.param('board')
            });
        }

    });
//    }
});
app.get('/boards/ownedboards', function (req, response) {
    if (req.param('email') != undefined) {
        boardProvider.findByEmail('admin@pramati.com', function (error, docs) {
            if (docs && docs.hasOwnProperty('email') && docs['email']) {
                response.send('200', {
                    success: "Created Successful",
                    board: docs
                });
            } else {
                response.send(401, {error: "unable to create whiteboard for the username " + req.param('email'), serverMsg: error});
            }

        });
    }
});
app.get('/boards/sharedBoards', function (req, response) {
    if (req.param('email') && req.param('email') != '') {
        boardProvider.findByEmail(req.param('email'), function (error, docs) {
            if (docs && docs.hasOwnProperty('email') && docs['email']) {
                response.send('200', {
                    success: "Created Successful",
                    sharedBoards: docs['board']
                });
            } else {
                response.send(401, {error: "unable to create whiteboard for the username " + req.param('email'), serverMsg: error});
            }

        });
    }
});


var userProvider = new UserProvider('localhost', 27017);

app.get('/initdb', function (req, res) {
    userProvider.save({
        email: 'admin@pramati.com',
        password: 'pramati123',
        sessionId: '',
        user: 'admin'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
    userProvider.save({
        email: 'user@pramati.com',
        password: 'pramati123',
        sessionId: '',
        user: 'user'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
    userProvider.save({
        email: 'user1@pramati.com',
        password: 'pramati123',
        sessionId: '',
        user: 'user1'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });

    boardProvider.save({
        email: 'admin@pramati.com',
        createdUrl: 'lbwz3zhs',
        sharedUrl: '',
        name: 'test by thulasiram'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });

    boardProvider.save({
        email: 'admin@pramati.com',
        createdUrl: 'w25hcdmm',
        sharedUrl: '',
        name: 'test1 by ramu'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });

    boardProvider.save({
        email: 'admin@pramati.com',
        createdUrl: '',
        sharedUrl: 'w25hadmm',
        name: 'shared to admin'
    }, function (error, docs) {
        Object.keys(docs).forEach(function (key) {
            console.log("test: " + key, docs[key]);
        });
//        res.redirect('/')
    });
});
//Routes
//index
app.get('/allboards', function (req, res) {
    boardProvider.findAll(function (error, result) {
        var obj = {
            email: 'boards',
            boards: result
        };
        // Visit non-inherited enumerable keys
        Object.keys(result).forEach(function (key) {
            var test = key + ' : ' + result[key];
            console.log(test);
        });
        res.send('index', {
            email: 'boards',
            boards: result
        });
    });
});
//Routes
//index
app.get('/userinfo', function (req, res) {

    userProvider.findByEmail(req['email'], function (error, docs) {
        if (error) {
            response.send(401, {error: "Unable to fetch user data", serverMsg: error});
        } else {
            Object.keys(docs).forEach(function (key) {
                if (docs[key]['sharedUrl'] && docs[key]['sharedUrl'] != "") {
                    sharedBoard.push(docs[key]);
                } else {
                    ownedBoard.push(docs[key]);
                }
            });
            response.cookie('auth', req['sessionId'], { maxAge: 5 * 60 * 1000, httpOnly: true });      //maxAge in milliseconds
            response.send('200', {
                success: "Login Successful",
                email: req['email'],
                user: req['user'],
                loginService: 'internal',
                name:docs['name']
            });
        }
    });

    userProvider.findAll(function (error, result) {
        var obj = {
            email: 'User',
            user: result
        };
        // Visit non-inherited enumerable keys
        Object.keys(result).forEach(function (key) {
            console.log("test: " + key, result[key]);
        });
        res.send('index', {
            email: 'User',
            user: result
        });
    });
});

app.get('/user', function (req, res) {
    userProvider.findAll(function (error, result) {
        var obj = {
            email: 'User',
            user: result
        };
        // Visit non-inherited enumerable keys
        Object.keys(result).forEach(function (key) {
            console.log("test: " + key, result[key]);
        });
        res.send('index', {
            email: 'User',
            user: result
        });
    });
});

//new user
app.get('/user/new', function (req, res) {
    res.send('user_new', {
        user: 'New User'
    });
});

//save new user
app.post('/user/new', function (req, res) {
    userProvider.save({
        email: req.param('email'),
        password: req.param('password'),
        user: req.param('user'),
        createdNum: req.param('createdNum'),
        sharedNum: req.param('sharedNum')
    }, function (error, docs) {
        res.redirect('/')
    });
});

//update an user
app.get('/user/:id/edit', function (req, res) {
    userProvider.findById(req.param('_id'), function (error, user) {
        res.send('user_edit',
            {
                email: user.email,
                user: user
            });
    });
});

//save updated user
app.post('/user/:id/edit', function (req, res) {
    userProvider.update(req.param('_id'), {
        email: req.param('email'),
        password: req.param('password'),
        user: req.param('user'),
        createdNum: req.param('createdNum'),
        sharedNum: req.param('sharedNum')
    }, function (error, docs) {
        res.redirect('/')
    });
});

//delete an user
app.post('/user/:id/delete', function (req, res) {
    userProvider.delete(req.param('_id'), function (error, docs) {
        res.redirect('/')
    });
});


app.listen(serverPort);
io.configure('production', function () {
    io.set('transports', ['xhr-polling']);
});
io.set('log level', 2);
console.log("%s Server listening on port %d in %s mode, started on %s", appName, serverPort, app.settings.env, new Date());