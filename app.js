var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var indexController = require('./controllers/index.js');
var googleController = require('./controllers/google.js');
var apiController = require('./controllers/apiController.js');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// SETUP MONGO
var mongoDB_URL = process.env.MONGOHQ_URL || 'mongodb://localhost'
mongoose.connect(mongoDB_URL + '/rootsApp');

// SETUP SOCKETS
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

io.on('connection', function(socket){
	console.log('Someone connected!');
});

// ROUTES

app.get('/', function(req, res) {
	indexController.index(req, res, io);
});
app.get('/scanredirect/:id', function(req, res) {
	indexController.saveScan(req, res, io);
});

app.get('/instructor', indexController.instructor);
app.get('/success', indexController.success);
app.get('/whoops', indexController.whoops);

app.get('/student-tracker', function(req, res) {
	indexController.studentTracker(req, res, io);
});
// Student Full schedule 
app.get('/student-full-schedule', indexController.studentFullSchedule);


//API Routes
app.post('/api/user', googleController.saveUser);
app.get('/api/user', apiController.getUsers);


// io.listen(app);

var port = process.env.PORT || 7060;

var server = http.listen(port, function() {
	console.log('Express server listening on port ' + server.address().port);
});
