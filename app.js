var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var indexController = require('./controllers/index.js');
var googleController = require('./controllers/google.js');

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

var mongoDB_URL = process.env.MONGOHQ_URL || 'mongodb://localhost'
mongoose.connect(mongoDB_URL + '/checkin');

app.get('/', indexController.index);
app.get('/auth', indexController.auth);
app.post('/auth/getProfile', googleController.getProfile);

// Next Step
app.get('/next-step/:id', indexController.nextStep);

// Calendar
app.get('/calendar/:id', indexController.calendar);



var server = app.listen(7060, function() {
	console.log('Express server listening on port ' + server.address().port);
});
