var User = require('../models/user.js');
var Scan = require('../models/Scan.js');
var _ = require('lodash');
var moment = require('moment');
// var io = require('socket.io')();

var indexController = {
	index: function(req, res) {
		res.render('index')
	},

	saveScan: function(req, res) {

		var scanned_data = req.query.scanned_data;
		var googleId = req.params.id;

		if (scanned_data) {
			console.log('Scanned data:', scanned_data);

			var currentTime = new Date();

			User.findOne({googleId: googleId}, function(err, user) {
				if (err) {
					console.error(err);
				}
				else {
					//find event in collection that is between event start time minus 5 min and event end time
					var currentEvent = _.find(user.calendar, function(event) {
						// console.log('event.start', event.start);
						// var start = moment(event.start).subtract(5, 'minutes');
						// console.log('start', start);
						return moment().isBetween(currentTime, event.end);
					});
					
					var newScan = {
						googleId: user.googleId,
						name: user.name,
						email: user.email,
						time: currentTime,
						scannedLocation: scanned_data,
						event: currentEvent
					};

					Scan.create(newScan, function(err, scan) {
						if (err) {
							console.error(err);
						}
						else {
							if (scan.scannedLocation === scan.event[0].location){
								console.log('your in correct location!');
								// io.sockets.emit('an event sent to all connected clients');
								res.redirect('/success');
							} else {
								console.log('next step goes here')
							}
							// Here put logic for what to do if the user is in the right place at the right time or not
							// Emit an event using sockets that someone has logged in. 
							// 
							// scan.save(function(err, results){
							// 	console.log('scan save results: ', results);
							// });
						}
					});
				}
			})
		}
		else {
			res.render('index')
		}
	},

	instructor: function(req, res){
		res.render('instructor');
	},

	success: function(req, res) {
		res.render('success')
	},

	lostKids: function(req, res) {
		console.log('hello users');
		// var kidsPics = _map
		res.render('lost-kids');
	},

	studentFullSchedule: function(req, res){
		res.render('student-full-schedule');
	}
};

module.exports = indexController;