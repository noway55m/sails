var log = require('log4js').getLogger(), 
	config = require('../config/config');

// Page for show the store in the floor of specific building
exports.download = function(req, res) {	
	res.render("others/download.html");
};