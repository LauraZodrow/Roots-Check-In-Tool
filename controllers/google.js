var https = require('https');
var User = require('../models/user');

module.exports = {
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
								console.log('About to redirect...');
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
	}
};