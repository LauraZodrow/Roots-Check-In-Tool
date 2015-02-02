var indexController = {
	index: function(req, res) {
		res.render('index');
	},

	auth: function(req, res) {
		res.render('auth');
	},

	calendar: function(req, res) {
		res.render('calendar', {googleId: req.params.id});
	},

	nextStep: function(req, res) {
		res.render('next-Step', {googleId: req.params.id});
	}
};

module.exports = indexController;