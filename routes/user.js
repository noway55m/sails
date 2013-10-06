var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
	uuid = require('node-uuid'),
	Building = require("../model/building"),
	User = require("../model/user");

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
 * GET Interface for list all users
 */
exports.list = function(req, res){

	User.find({}, function(err, users){
		
		if(err)
			log.error(err);
		
		res.send(200, users);
		
	});
	
};



/*
 * GET Index page of admin user showing all buildings.
 */
exports.adminIndex = function(req, res){

};


// Page for show all users
exports.all = function(req, res){
	
	res.render("user/all.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user,
        imagePath: public_image_path,
        ROLES: User.ROLES
	});
	
};

// GET Interface for get all users 
exports.list = function(req, res){
	
	User.find({}, function(err, users){
		
		if(err)
			log.error(err);
		
		res.send(200, users);
		
	});
	
};


// POST Interface for get all users 
exports.create = function(req, res){
	
	var token;
	if(req.body.role == User.ROLES.ADMIN ||
			req.body.role == User.ROLES.DEVELOPER )
		token = User.genToken();
	
	new User({
		
		username: req.body.username,
		password: req.body.password,		
		role: req.body.role,
		token: token
		
	}).save(function(err, user){
		
		if(err)
			log.error(err);
		
		res.send(200, user);
		
	});
	
};


// POST Interface for update user info
exports.update = function(req, res){
	
	console.log(req.body)
	User.findById(req.body._id, function(err, user){
		
		if(err)
			log.error(err);
		
		if(user){
			user.role = req.body.role;
			user.save(function(err, user){
				res.send(200, user);
			})
		}
		
	});
	
};


// POST Interface for change password of sepcific user
exports.changePassword = function(req, res){
	
	console.log("dkkkkkkkkkkkkkkkkk")
	console.log(req.body);
	User.findById(req.body._id, function(err, user){
		
		if(err)
			log.error(err);
		
		if(user){
			user.password = User.encodePassword(req.body.password);
			user.save(function(err, user){
				
				if(err)
					log.error(err);
				
				if(user)
					res.send(200, user);
				
			});
		}
		
	});
		
};
