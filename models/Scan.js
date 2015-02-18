var mongoose = require('mongoose');

var scanSchema = mongoose.Schema ({
	name: String,
	email: String,
	googleId: String,
	time: Date,
	location: String,
	event: {
		date: String,
		eventId: String,
		location: String,
		creator: String,
		start: String,
		end: String,
		description: String
	}
});

module.exports = mongoose.model('scan', scanSchema);