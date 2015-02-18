var User = require('../models/user.js');
var Scan = require('../models/Scan.js');

var indexController = {
	index: function(req, res) {
		res.render('index');
		// console.log('Next step query data:', req.query);
		// if (req.query.scanned_data) {
		// 	console.log('Scanned data:', scanned_data);
		// 	var currentTime = new Date();
		// 	console.log('Current time:', currentTime);

		// 	User.findOne({id: req.params.id}, function(err, user) {
		// 		if (err) {console.error(err);}
		// 		else {
		// 			var currentEvent = _.find(user.calendar, function(event) {
		// 				return moment(currentTime).isBetween(event.start, event.end);
		// 			});
		// 			console.log('Current event:', currentEvent);
					
		// 			var newScan = {
		// 				googleId: user.googleId,
		// 				name: user.name,
		// 				email: user.email,
		// 				time: currentTIme,
		// 				location: req.query.scanned_data,
		// 				event: currentEvent
		// 			}
		// 			Scan.create(newScan, function(err, scan) {
		// 				if (err) {
		// 					console.error(err);
		// 				}
		// 				else {
		// 					console.log('Created event on scan:', scan);
		// 					// Here put logic for what to do if the user is in the right place at the right time or not
		// 					// Emit an event using sockets that someone has logged in. 
		// 					// 
		// 				}
		// 			});
		// 		}
		// 	})
		// }
		// else {
		// 	res.render('index', {
		// 		googleId: req.params.id.toString(),
		// 		user:  req.user
		// 	});
		// }
	},

	auth: function(req, res) {
		res.render('auth');
	},

	calendar: function(req, res) {
		res.render('calendar');
	},

	nextStep: function(req, res) {
		res.render('next-step');
	},

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