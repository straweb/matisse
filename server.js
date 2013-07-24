/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    settings = require('./settings.js'),
    appName = settings.appName,
    serverPort = settings.serverPort;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

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
    var email;
    var cookies = {};
    request.headers.cookie && request.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
        console.log(parts[1].trim().toString());
        if (parts[0] == "auth") {
            email = decodeURIComponent(parts[1]);
        }
    });

    if (email) {
        response.cookie('auth', settings.users[email].email, { maxAge:900000, httpOnly:true });
        response.sendfile(baseDir + 'index.html', {success:"Login Successful", user:settings.users[email].user, createdNum:settings.users[email].createdNum, sharedNum:settings.users[email].sharedNum});
//                response.sendfile(baseDir + 'index.html', {success: "Login Successful", user: settings.users[email].user, createdNum: settings.users[email].createdNum , sharedNum: settings.users[email].sharedNum});
    } else {
        response.sendfile(baseDir + 'index.html');
    }
});

app.post('/logout', function (request, response) {
    response.clearCookie('auth');
//            response.sendfile(baseDir + 'index.html');
    response.end();
});

app.post('/authenticate', function (request, response) {
    var email = request.param('email');
    var password = request.param('password');

    if (settings.users[email] && password === settings.users[email].password) {
        response.cookie('auth', settings.users[email].email, { maxAge:900000, httpOnly:true });

        response.send(200, {success:"Login Successful", user:settings.users[email].user, createdNum:settings.users[email].createdNum, sharedNum:settings.users[email].sharedNum});
    } else {
        response.send(401, {error:"Invalid username or password"});
    }
    response.end();
});

app.listen(serverPort);
console.log("%s Server listening on port %d in %s mode, started on %s", appName, serverPort, app.settings.env, new Date());