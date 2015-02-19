var https = require('https');
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');
var bodyParser = require('body-parser');

var googleController = {
	
	saveUser: function(req, res){
		var data = req.body
		console.log('data', req.body);
		// console.log('Data keys', Object.keys(data))
		// console.log('Calendar data', JSON.parse(data));
		User.findOne({ googleId: data.id}, function(err, user) {
			// console.log('user', user);
			// console.log('data', data);
			if (!user) {
				User.create({
					email: data.email,
					googleId: data.id,
					name: data.name,
					image: data.image,
					calendar: data.calendar
				}, function(err, user) {
					if (err) {
						console.error(err);
						res.send(err);
					}
					else { 
						res.send(user);
					}
				});
			} else {
				user.update({$set: {calendar: data.calendar} }, function(err, user) {
					if (err) {
						console.error(err);
						res.send(err);
					}
					else { 
						res.send(user);
					}
				});
			}	
		});
	}

	// getCalendar: function(req, res) {
	// 	var id = req.params.id; 

	// 	User.findOne({googleId : id}, function(err, user) {
	// 		var googleEmail = user.email;
	// 		https.get('https://www.googleapis.com/calendar/v3/calendars/' + googleEmail + '/events/?access_token=' + user.access_token , function(response){
	// 			var datastring = '';
			
	// 			// Accumulate the response data into a string
	// 			response.on('data', function(data){
	// 				datastring += data;
	// 			});

	// 			response.on('end', function() {
	// 				var data = JSON.parse(datastring);
	// 				var events_array = data.items;
	// 				console.log('events_array', events_array);

	// 				var todaydate = moment().format();
	// 				var splitTodayDate = todaydate.split("T");
	// 				var spliceTodayDate = splitTodayDate.splice(0,1);
	// 				var currentDate = spliceTodayDate.toString();

					

	// 				var todays_events = _.filter(data.items, function(event) {
	// 					return event.start.dateTime.split("T").splice(0,1).toString() == currentDate;
	// 				});

	// 				_.forEach(todays_events, function(event) {

	// 					newEvent = {
	// 						date: event.start.dateTime.split("T").splice(0,1).toString(),
	// 						eventId: event.id,
	// 						location: event.location,
	// 						creator: event.creator.email,
	// 						// TODO: Figure out how to get start time
	// 						start: event.start.dateTime,
	// 						end: event.end.dateTime,
	// 						description: event.description
	// 					};
	// 					var eventExists = _.some(user.calendar, function(event) {
	// 						return event.eventId === newEvent.eventId;
	// 					});
	// 					if (!eventExists) {
	// 						user.calendar.push(newEvent);
	// 					}
	// 				});

	// 				user.save(function(err, result){
	// 					res.send(result);
	// 				});

	// 			});
		
	// 		});
	// 	});

	// },
};

module.exports = googleController; 