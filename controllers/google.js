var https = require('https');
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');

var googleController = {
	getProfile: function(req, res) {
		
		// var options = {
		// 	url: 'googleapis.com/',
		// 	path: '/plus/v1/people/' + req.body.userid,
		// 	headers: {
		// 		Authorization: 'Bearer ' + req.body.access_token,
		// 		'x-li-format': 'json'
		// 	}
			
		// };

		// https.get(options, function(response) {
		// 	var datastring = '';
		// 	response.on('data', function(data){
		// 		datastring += data;
		// 		console.log('dat type', typeof data);
		// 	});

		// 	response.on('error', function(err){
		// 		console.log('error:', err);
		// 	})

		// 	response.on('end', function() {
		// 		console.log('type of all data:', typeof datastring);
		// 		console.log('All data:', datastring)
		// 		res.send({ message: 'hello'});
		// 	});
		// });
	
		// Make the request to google to get the email and name of the user
		https.get('https://www.googleapis.com/plus/v1/people/'+ req.body.userid +'?access_token=' + req.body.access_token, function(response) {
			var datastring = '';
			
			// Accumulate the response data into a string
			response.on('data', function(data){
				datastring += data;
			});

			// When the response is done, save and return the saved user object
			response.on('end', function() {
				var data = JSON.parse(datastring);
				
				// See if there is already a user with this user id
				User.findOne({ googleId: data.id}, function(err, user) {

					// If there is a user, update the access_token and send it back
					if (user) {
						user.update({access_token: req.body.access_token}, function(err, num, updated_user) {
							if (err) { 
								console.log(err);
								res.send(err);
							}
							else {
								res.send({id: data.id});
							}
						});
					}
					// If there is not a user, save it and send back the results
					else {
						User.create({
							email: data.emails[0].value,
							googleId: data.id,
							name: data.displayName,
							access_token: req.body.access_token,
							calendar: []
						}, function(err, user) {
							if (err) {
								console.error(err);
								res.send(err);
							}
							else { 
								res.send({id: data.id});
							}
						});
					}
				})
			});
		});
	},
	

	getCalendar: function(req, res) {
		var id = req.params.id; 

		User.findOne({googleId : id}, function(err, user) {
			var googleEmail = user.email;
			https.get('https://www.googleapis.com/calendar/v3/calendars/' + googleEmail + '/events/?access_token=' + user.access_token , function(response){
				var datastring = '';
			
				// Accumulate the response data into a string
				response.on('data', function(data){
					datastring += data;
				});

				response.on('end', function() {
					var data = JSON.parse(datastring);
					var events_array = data.items;

					var todaydate = moment().format();
					var splitTodayDate = todaydate.split("T");
					var spliceTodayDate = splitTodayDate.splice(0,1);
					var currentDate = spliceTodayDate.toString();
					

					var todays_events = _.filter(data.items, function(event) {
						return event.start.dateTime.split("T").splice(0,1).toString() == currentDate;
					});

					_.forEach(todays_events, function(event) {
						console.log('TIME', event.start.dateTime);

						newEvent = {
							date: event.start.dateTime.split("T").splice(0,1).toString(),
							eventId: event.id,
							location: event.location,
							creator: event.creator.email,
							// TODO: Figure out how to get start time
							start: event.start.dateTime,
							description: event.description
						};
						var eventExists = _.some(user.calendar, function(event) {
							return event.eventId === newEvent.eventId;
						});
						if (!eventExists) {
							user.calendar.push(newEvent);
						}
					});

					user.save(function(err, result){
						res.send(result);
					});

				});
		
			});
		});

	}
};

module.exports = googleController; 