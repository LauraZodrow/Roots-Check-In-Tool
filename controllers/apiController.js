var https = require('https');
try {
	var Scan = require('../models/scan');
} catch (err) {
	console.error(err);
}
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');
var async = require('async');

var apiController = {

	// Return all users
	getUsers: function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				console.error(err);
			} else {
				res.send(users);
			}
		});
	},
	
	// Return one user
	getUser: function(req, res) {
		User.findOne({googleId: req.params.id}, function(err, user) {
			if (err) {
				console.error(err);
			} else {
				res.send(user);
			}
		});
	},

	// On receiving a scan, save it, and then add it to the student who scanned in
	saveScan: function(req, res, io) {

		var scanned_data = req.query.scanned_data;
		var googleId = req.params.id;

		if (scanned_data) {
			var currentTime = moment();

			User.findOne({googleId: googleId}, function(err, user) {
				if (err) {
					console.error(err);
				}
				else {
					var correct;
					//find event in collection that is between event start time minus 5 min and event end time
					var currentEvent = _.find(user.calendar, function(event) {
						return moment(currentTime).isBetween(moment(event.start).subtract(5, 'minutes'), event.end);
					});

					// if there's not a current google calendar event, get the next grove calendar event, and if the scan matches the correct event, change the calendar to indicate that the student has checked in
					if (!currentEvent) {
						var index = _.findIndex(user.groveCalendar, function(event) {
							return !event.checkedIn; 
						});
						currentEvent = user.groveCalendar[index]
						if (currentEvent.location === scanned_data) {
							user.groveCalendar[index].checkedIn = true;
						}
					}
					
					// Set correctness
					correct = (currentEvent.location === scanned_data);
				
					var newScan = {
						googleId: user.googleId,
						name: user.name,
						email: user.email,
						image: user.image,
						time: currentTime,
						scannedLocation: scanned_data,
						event: [currentEvent],
						correct: correct
					};

					Scan.create(newScan, function(err, scan) {
						if (err) {
							console.error(err);
						}
						else {
							io.emit('SCAN!', scan);
							// Update the user
							user.recentScan = newScan;
							user.save(function(err, result){
								if (err) {
									console.error(err);
									res.redirect('/error_saving');
								} else {
									// Redirect the student
									if (scan.correct) {
										res.redirect('/success');
									} else {
										res.redirect('/whoops')
									}
								}
							});
							
						}
					});
				}
			})
		}
		else {
			res.render('index')
		}
	},

	// Return grove calendar for one student
	getGroveCalendar: function(req, res) {
		User.findOne({googleId: req.params.user_id}, function(err, user) {
			if (err) {
				console.error(err);
			} else {
				res.send(user.groveCalendar);
			}
		})
	},

	// List all students with basic info + groveCalendar
	listGroveCalendars: function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				console.error(err);
			} else {
				res.send(_.map(users, function(user) { 
					return _.pick(user, ['_id', 'email', 'name', 'image', 'googleId', 'groveCalendar']);
				}));
			}
		});
	},

	// Update one student's groveCalendar
	updateGroveCalendar: function(req, res) {
		User.update({googleId: req.params.user_id}, { groveCalendar: req.body.calendar}, {}, function(err, numAffected){
			if (err) {
				console.error(err);
				res.send(err);
			} else {
				res.status(200).end();
			}
		});
	}
};

module.exports = apiController; 