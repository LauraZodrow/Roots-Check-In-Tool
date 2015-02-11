var indexController = {
	index: function(req, res) {
		res.render('index');
	},

	auth: function(req, res) {
		res.render('auth');
	},

	calendar: function(req, res) {
		res.render('calendar');
	},

	nextStep: function(req, res) {
		res.render('next-Step', {
			googleId: req.params.id.toString(),
			user:  req.user
		});
	},

	scanInput: function(req, res){
		res.render('scan-input');
	}
};

module.exports = indexController;