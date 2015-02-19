var https = require('https');
var User = require('../models/user');
var _ = require('lodash');
var moment = require('moment');

var apiController = {

	getProfileImage: function(req, res){
		console.log('I work')
		User.find({}, function(err, users){
			var allUsers = _.map(users, 'name');
			console.log('allUsers', allUsers);
			res.send(allUsers);
		});
	}
}

module.exports = apiController; 