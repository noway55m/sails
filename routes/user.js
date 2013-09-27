var log = require('log4js').getLogger("User"),
	Building = require("../model/building");

/*
 * GET Index page of user showing all his/her buildings.
 */
exports.index = function(req, res){
	
	res.render("user/index.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user
	});		
		
};

/*
 * GET Index page of admin user showing all buildings.
 */
exports.adminIndex = function(req, res){
	
	Building.find({}, function(err, buildings){
		
		if(err)
			log.error(err);
		
		console.log(buildings);

		res.render("user/index.html", {
			url: req.url.toString(), // use in layout for identify display info
			user: req.user
		});		
		
	});
	
};