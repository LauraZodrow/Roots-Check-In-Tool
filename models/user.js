var mongoose = require('mongoose');

var userSchema = mongoose.Schema ({
	googleId: String,
	name: String,
	email: String,
	image: String,
	access_token: String,
	// calendar_id: String
	calendar: [{
		eventId: String,
		location: String,
		creator: String,
		start: String,
		end: String,
		description: String
	}]
});

module.exports = mongoose.model('user', userSchema);