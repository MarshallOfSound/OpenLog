#!/usr/bin/env node

var express = require('express'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    Engine = require('tingodb')(),
    basicAuth = require('basic-auth'),
    fs = require('fs'),
    execSync = require('sync-exec'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../config.inc.json')),
    store = (fs.existsSync(__dirname + '/store') ? null : fs.mkdirSync(__dirname + '/store')),
    db = new Engine.Db(__dirname + '/store', {}),
    collection = db.collection("log_storage"),
    app = express();

if (process.args) {
    if (process.args.config) {
        config = process.args.config;
    }
    if (process.args.db) {
        db = process.args.db;
        collection = db.collection("log_storage");
    }
}

const PORT = config.server.port;

// Simple function to color text in the console output
function logColor(msg, color) {
    var colors = {
        red: ['\x1b[31m', '\x1b[0m'],
        green: ['\x1b[32m', '\x1b[0m'],
        yellow: ['\x1b[33m', '\x1b[0m'],
        blue: ['\x1b[34m', '\x1b[0m']
    };
    return (!colors[color] ? msg : colors[color][0] + msg + colors[color][1]);
}

// First lets make sure the server files have been generated
if (!(fs.existsSync(__dirname + '/public') && fs.existsSync(__dirname + '/public/css') && fs.existsSync(__dirname + '/public/fonts') && fs.existsSync(__dirname + '/public/js'))) {
    console.warn("Server doesn't appear to be built, attempting to build now");
    var buildLog = execSync('grunt build', {cwd: __dirname + '/../'});
    if (buildLog.stderr === '' && buildLog.status === 0) {
        console.log(logColor('Server built successfully', 'green'));
    } else {
        console.error(logColor(buildLog.stderr, 'yellow'));
        console.error(logColor('Server failed to build, please try building manually with the \'grunt build\' command', 'yellow'));
        return false;
    }

}
// Basic error function if a request goes wrong
var err = function(error, res) {
    res.status(500);
    var json = {error: error};
    res.json(json);
};
// Basic HTTP Authentication function
var auth = function(req, res, next) {
    if (req.originalUrl !== '/log' && config.auth !== null && config.auth.length !== 0) {
        function notAuthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }

        var user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
            return notAuthorized(res);
        }

        for (var i = 0; i < config.auth.length; i++) {
            if (user.name === config.auth[i].user && user.pass === config.auth[i].password) {
                return next();
            }
        }
        return notAuthorized(res);
    }
    return next();
};

// Enable basic authentication
app.use(auth);

// Allow cross origin requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Setup the HTML engine
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Enable gzip compression
app.use(compression());

// Make the public directory public
app.use(express.static(__dirname + '/public'));

// Enable JSON body reading
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// The base route for the OpenLog console
app.get('/', function(req, res) {
    res.render('index');
});

// Require the route files
// The post route to receive logs
require(__dirname + '/routes/capture_post')(app, collection, err);
// The REST routes for the OpenLog console
require(__dirname + '/routes/rest')(app, collection, err);

console.log("OpenLog server listening on port:", logColor(PORT, 'blue'));

module.exports = app.listen(PORT);
