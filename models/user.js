var mongoose = require('mongoose');

var userSchema = mongoose.Schema ({
	googleId: String,
	name: String,
	email: String,
	access_token: String,
	// calendar_id: String
	calendar: []
});

module.exports = mongoose.model('user', userSchema);