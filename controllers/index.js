var User = require('../models/user.js');
var Scan = require('../models/scan.js');
var _ = require('lodash');
var moment = require('moment');


var indexController = {
	index: function(req, res, io) {
		res.render('index')
	},

	saveScan: function(req, res, io) {

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
						image: user.image,
						time: currentTime,
						scannedLocation: scanned_data,
						event: currentEvent
					};

					Scan.create(newScan, function(err, scan) {
						if (err) {
							console.error(err);
						}
						else {
							io.emit('SCAN!', scan);
							console.log('SCAN!', scan);
							if (scan.event && scan.scannedLocation === scan.event[0].location) {
								console.log('your in correct location!');
								res.redirect('/success');
							} else {
								res.redirect('/whoops')
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
			// TODO: Create a redirect page for failed scans
			res.render('index')
		}
	},

	instructor: function(req, res){
		res.render('instructor');
	},

	success: function(req, res) {
		res.render('success')
	},

	whoops: function(req, res){
		res.render('whoops')
	},

	studentTracker: function(req, res) {

		res.render('student-tracker');
	},

	studentFullSchedule: function(req, res){
		res.render('student-full-schedule');
	}
};

module.exports = indexController;