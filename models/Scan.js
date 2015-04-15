var mongoose = require('mongoose');

var scanSchema = mongoose.Schema ({
	name: String,
	email: String,
	googleId: String,
	image: String,
	time: String,
	scannedLocation: String,
	correct: Boolean,
	event: [{
		eventId: String,
		location: String,
		creator: String,
		start: String,
		end: String,
		activity: String,
		summary: String
	}]
});

module.exports = mongoose.model('scan', scanSchema);