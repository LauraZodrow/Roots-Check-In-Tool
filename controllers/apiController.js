var https = require('https');
var User = require('../models/user');
var Scan = require('../models/scan');
var _ = require('lodash');
var moment = require('moment');
var async = require('async');

var apiController = {

	// getProfileImage: function(req, res){
	// 	console.log('I work')
	// 	User.find({}, function(err, users){
	// 		var allUsers = _.map(users, 'name');
	// 		console.log('allUsers', allUsers);
	// 		res.send(allUsers);
	// 	});
	// }

	// Return the basic user info as well as current location
	getUsers: function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				console.error(err);
			} else {
				// Create a function for each student that finds the most recent scan, adds a location property to the student, and returns the student
				var today = moment().startOf('day');
				var studentFunctions = _.map(users, function(user) {
					return function(callback) {
						Scan.find({$and: [{googleId: user.googleId}, {time: {$gte: today}}]}, function(err, results) {
							if (err) {
								console.error(err);
								callback(err);
							} else {
								// If there have been scans today, find the most recent one and set the student's location to the location of that scan
								if (results.length) {
									var recentScan = _.max(results, 'time');
									user.recentScan = recentScan;
									// Now that we have our user, invoke our callback with the results
									callback(null, _.pick(user, ['_id', 'email', 'name', 'image', 'googleId', 'recentScan']));
								} else {
									callback(null, _.pick(user, ['_id', 'email', 'name', 'image', 'googleId']));
								}
							}
						});
					}
				});
				// Now call all those student functions in parallel, and send back the results
				async.parallel(studentFunctions, function(err, results) {
					if (err) {
						console.error('Error:', err);
						res.send(err);
					} else{
						res.send(results);
					}
				});
			}
		});
	}
};

module.exports = apiController; 