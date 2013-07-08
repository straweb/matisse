(function () {
    "use strict";
    var express = require('express'),
        app = express(),
        settings = require('./settings.js'),
        appName = settings.appName,
        serverPort = settings.serverPort;

    (function setupRoutes() {
        var baseDir = __dirname + '/client/';
        app.use(express.bodyParser());
        //lets setup the static routes
        ['public'].forEach(function (staticRoute) {
            app.use('/' + staticRoute, express.static(baseDir + staticRoute));
        });

        app.get('/', function (request, response) {
            response.sendfile(baseDir + 'index.html');
        });

        app.post('/authenticate', function (request, response) {
            var email = request.param('email');
            var password = request.param('password');
            if (settings.users[email] && password === settings.users[email].password) {
                response.send(200, {success: "Login Successful", user: settings.users[email].user});
            } else {
                response.send(401, {error: "Invalid username or password"});
            }
            response.end();
        });
    }());
    app.listen(serverPort);
    console.log("%s Server listening on port %d in %s mode, started on %s", appName, serverPort, app.settings.env, new Date());
}());