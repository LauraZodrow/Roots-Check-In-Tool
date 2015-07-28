var indexController = {
	index: function(req, res, socket) {
		res.render('index')
	},
	instructor: function(req, res){
		res.render('instructor');
	},

	success: function(req, res) {
		res.render('success')
	},

	whoops: function(req, res){
		res.render('index', {fail: true});
	},

	studentTracker: function(req, res, socket) {
		res.render('student-tracker');
	},

	studentFullSchedule: function(req, res){
		res.render('student-full-schedule');
	},
	groveCalendar: function(req, res){
		res.render('grove-calendar');
	}
};

module.exports = indexController;