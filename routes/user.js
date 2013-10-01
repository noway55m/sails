var log = require('log4js').getLogger("User"),
	Building = require("../model/building");

// Static variable
var resource_path = "./resource/",
    public_image_path = "client-image",
    mapzip_path = resource_path + "mapzip",
    image_path = "public/" + public_image_path;


/*
 * GET Index page of user showing all his/her buildings.
 */
exports.index = function(req, res){

	res.render("user/index.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user,
        imagePath: public_image_path
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
			user: req.user,
            imagePath: public_image_path
		});

	});

};