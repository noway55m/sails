var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
	uuid = require('node-uuid'),
	Building = require("../model/building"),
	User = require("../model/user"),
	ResetPasswordToken = require("../model/resetPasswordToken"),	
    mailer = require('../config/nodemailerSetup'),
    config = require('../config/config.js');

// Static variable
var resource_path = "./resource/",
    public_image_path = "client-image",
    mapzip_path = resource_path + "mapzip",
    image_path = "public/" + public_image_path;


// GET Page for show user profile info
exports.profile = function(req, res){

	res.render("user/profile.html");	
	
};

// GET Interface for read specific user
exports.read = function(req, res){

	User.findById(req.params._id, function(err, user){
		
		if(err)
			log.error(err);
		
		if(user)
			res.send(200, user)
		
	});	
	
};


// GET Index page of user showing all his/her buildings.
exports.index = function(req, res){

	res.render("user/index.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user,
        imagePath: public_image_path
	});

};

// GET Interface for list all users
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

	User.findById(req.body._id, function(err, user){

		if(err)
			log.error(err);

		if(user){

		    // Check upgrade user to "admin" or "developer" for get token
		    console.log(req.body.role)
			if( (req.body.role == User.ROLES.ADMIN || req.body.role == User.ROLES.DEVELOPER) &&
			   user.role == User.ROLES.FREE)
			    user.token = User.genToken();
			user.role = req.body.role;
			user.save(function(err, user){
				res.send(200, user);
			});

		}

	});

};


// POST Interface trigger reset password while forget password
exports.forgetPassword = function(req, res){
	
	if(req.body.email){
		
		var email = req.body.email;
		User.findOne({
		
			username: email
			
		}, function(err, user){
			
			if(err)
				log.error(err);
			
			if(user){
				
				new ResetPasswordToken({
					
				    token: User.genToken(), 			        
				    userId: user.id,				    
					createdAt :	new Date()				
					
				}).save(function(err, token){
					
					if(err)
						log.error(err);
					
					if(token){
						
						// Send mail with defined transport object
						var mailOptions = {
							from : mailer.defaultOptions.from, // sender address
							to : email, // list of receivers
							subject : "Sails Cloud Service Notification", // Subject line
							text : "Please Click following link to reset your password", // plaintext body
							html : "<b>Welcome join to Sails Cloud Service</b>" + 
									"<a href='" + config.domainUrl + "/resetPassword/" + token + "'>Reset Password</a>" // html body
						};

						mailer.sendMail(mailOptions, function(error, response) {
							
							if (error) {
								log.error(error);
							} else {
								log.error("Message sent: " + response.message);
								res.json(200,{
									msg: "Please check your email address, we have sent the reset password email to you"
								});
							}

						});							
												
					}
								
				});
							
			}else{
				
				res.json(400, { 
					msg: "This email address does not exist in system" 
				});
				
			}
			
		});
		
		
	}
	
	
};

// POST Interface for change password of sepcific user
exports.resetPassword = function(req, res){

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
