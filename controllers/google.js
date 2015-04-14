var https = require('https');
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');
var bodyParser = require('body-parser');

var googleController = {
	
	saveUser: function(req, res){
		var data = req.body

		User.findOne({ googleId: data.id}, function(err, user) {

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
};

module.exports = googleController; 