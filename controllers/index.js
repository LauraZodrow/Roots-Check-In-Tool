var User = require('../models/user.js');
var Scan = require('../models/Scan.js');
var _ = require('lodash');
var moment = require('moment');

var indexController = {
	index: function(req, res) {
		res.render('index')
	},

	saveScan: function(req, res) {

		var scanned_data = req.query.scanned_data;
		var googleId = req.params.id;

		if (scanned_data) {
			console.log('Scanned data:', scanned_data);
			console.log('googleId', googleId);
			var currentTime = new Date();
			console.log('Current time:', currentTime);

			User.findOne({googleId: googleId}, function(err, user) {
				console.log ('Arguments of findOne', arguments)
				if (err) {
					console.error(err);
				}
				else {
					var currentEvent = _.find(user.calendar, function(event) {
						var start = moment(event.start).subtract(5, 'minutes');
						return moment(currentTime).isBetween(start, event.end);
					});
					console.log('Current event:', currentEvent);
					
					var newScan = {
						googleId: user.googleId,
						name: user.name,
						email: user.email,
						time: currentTime,
						location: scanned_data,
						event: currentEvent
					};

					Scan.create(newScan, function(err, scan) {
						if (err) {
							console.error(err);
							res.end()
						}
						else {
							console.log('Created event on scan:', scan);
							// Here put logic for what to do if the user is in the right place at the right time or not
							// Emit an event using sockets that someone has logged in. 
							// 
							res.send('Bye bye!');
						}
					});
				}
			})
		}
		else {
			res.render('index')
		}
	},

	// nextStep: function(req, res) {
	// 	res.render('next-step', {
	// 		id: req.params.id.toString(),
	// 		user:  req.user
	// 	});
	// },

	scanInput: function(req, res){
		res.render('scan-input');
	},

	pullOutLocations: function(req, res){
		res.render('pullout-locations');
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