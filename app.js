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

//Socket.io requirements 
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// io.on('connection', function(socket){
// 	console.log('user connected');
// 	socket.emit('alert', 'hello from server!')
// });

var mongoDB_URL = process.env.MONGOHQ_URL || 'mongodb://localhost'
mongoose.connect(mongoDB_URL + '/rootsApp');


app.get('/', indexController.index);
app.get('/:id', indexController.saveScan);


app.get('/instructor', indexController.instructor);
app.get('/success', indexController.success);

app.get('/lost-kids', indexController.lostKids);
// Student Full schedule 
app.get('/student-full-schedule', indexController.studentFullSchedule);


//API Routes
app.post('/api/saveUser', googleController.saveUser);


var server = app.listen(7060, function() {
	console.log('Express server listening on port ' + server.address().port);
});
