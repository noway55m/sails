var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
	uuid = require('node-uuid'),
	Building = require("../model/building"),
	User = require("../model/user"),
	ResetPasswordToken = require("../model/resetPasswordToken"),	
    PoiTag = require("../model/poiTag"),
    mailer = require('../config/nodemailerSetup'),
    config = require('../config/config.js'),
    utilityS = require("./utility.js"),
    i18n = require("i18n");

// Static variable
var errorResInfo = utilityS.errorResInfo,
	resource_path = "./resource/",
    public_image_path = "client-image",
    mapzip_path = resource_path + "mapzip",
    image_path = "public/" + public_image_path;


// GET Page for show user profile info
exports.profile = function(req, res){

	res.render("user/profile.html");	
	
};

// GET Interface for read specific user
exports.read = function(req, res){

	if(req.params._id){

		User.findById(req.params._id, function(err, user){
			
			if(err){

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});  	
			
			} else {

				if(user) {

					res.json(errorResInfo.SUCCESS.code, user);

				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: i18n.__('error.400IncorrectParams')
					}); 

				}

			}
			
		});	

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}	
	
};


// GET Index page of user showing all his/her buildings.
exports.index = function(req, res){

	//	console.log(ff);
	// var error = new Error("fffff");
	// error.status = 409;
	// throw error;

	res.render("user/index.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user,
        imagePath: public_image_path
	});

};

// POST Interface trigger reset password while forget password
exports.forgetPassword = function(req, res){
	
	if(req.body.email){
		
		var email = req.body.email;
		User.findOne({
		
			username: email
			
		}, function(err, user){
			
			if(err){

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});

			} else {

				if(user){
					
					new ResetPasswordToken({
						
					    token: User.genToken(), 			        
					    userId: user.id,				    
						createdAt :	new Date()				
						
					}).save(function(err, rtoken){
						
						if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});

						} else {

							if(rtoken){
								
								// Send mail with defined transport object
								var mailOptions = {
									from : mailer.defaultOptions.from, // sender address
									to : email, // list of receivers
									subject : i18n.__('user.resetPasswordEmail.title'), // Subject line
									text : i18n.__('user.resetPasswordEmail.title'), // plaintext body
									html : i18n.__('user.resetPasswordEmail.content', { domainUrl: config.domainUrl, token: atoken.token })// html body
								};

								mailer.sendMail(mailOptions, function(error, response) {
									
									if (error) {

										log.error(error);

									} else {

										log.error("Message sent: " + response.message);
										res.json(errorResInfo.SUCCESS.code,{
											msg: i18n.__('user.resetPasswordNotify')
										});

									}

								});							
														
							}

						}
															
					});
								
				}else{
					
					res.json(errorResInfo.INCORRECT_PARAMS.code, { 
						msg: i18n.__('user.emailNotExist') 
					});
					
				}

			}
			
		});		
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}
		
};

// POST Page for change password of specific user
exports.resetPassword = function(req, res){

	if(req.params.token){
		
		// Set local variables
    	res.locals.user = req.user;
    	res.locals.roles = User.ROLES;
    	res.locals.url = req.url.toString();
    	res.locals.imagePath = public_image_path;		
		
		ResetPasswordToken.findOne({
		
			token: req.params.token
			
		}, function(err, rtoken){
			
			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});

			} else {

				if(rtoken){
					
					res.render("user/reset-password.html", {
						userId: rtoken.userId,
						token: rtoken.token
					});	
									
				}else{
					
					res.json( errorResInfo.INCORRECT_PARAMS.code, {
						msg: "Incorrect token"
					});
									
				}

			}
						
		});
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}

};

// POST Interface for auth reset password of specific user
exports.resetPasswordAuth = function(req, res){
	
	if(req.body._id) {

		User.findById(req.body._id, function(err, user){

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});

			} else {

				if(user) {
					
					var opassword = User.encodePassword(req.body.password);
					if(opassword == user.password){
						
						user.password = User.encodePassword(req.body.npassword);
						user.save(function(err, user){

							if(err) {

					            log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: i18n.__('error.500Error')
								});

							} else {

								if(user){
									
									// Remove token
									ResetPasswordToken.findOneAndRemove({

										token: req.body.token

									}, function(err){

										if(err)
											log.error(err);

										res.json( errorResInfo.SUCCESS.code, user);

									});
								
								}

							}

						});				
						
					}else{
						
						res.json( errorResInfo.INCORRECT_PARAMS.code, {					
							msg: "Original password is incorrect"					
						});
										
					}
					
				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: i18n.__('error.400IncorrectParams')
					}); 

				}

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}

};

// POST Interface for change password of specific user
exports.changePassword = function(req, res){
	
	if(req.body._id) {

		User.findById(req.body._id, function(err, user){

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});

			} else {

				if(user){
					
					var opassword = User.encodePassword(req.body.password);
					if(opassword == user.password){
						
						user.password = User.encodePassword(req.body.npassword);
						user.save(function(err, user){

							if(err) {

					            log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: i18n.__('error.500Error')
								});

							} else {

								if(user)
									res.json( errorResInfo.SUCCESS.code, user);

							}						

						});				
						
					}else{
						
						res.json( errorResInfo.INCORRECT_PARAMS.code, {					
							msg: "Original password is incorrect"					
						});
										
					}
					
				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: i18n.__('error.400IncorrectParams')
					}); 

				}

			}
				
		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}

};

// POST Interface for notify server about upgrade developer
exports.upgradeDeveloper = function(req, res){
	
	if(req.body.msg && req.body.email){
		
		// Send mail with defined transport object
		var mailOptions = {
			from : req.body.email, // sender address
			to : mailer.defaultOptions.from, // list of receivers
			subject : "Upgrade Developer Request", // Subject line
			text : "Upgrade Developer Request", // plaintext body
			html : "<b>Upgrade Developer Request from user with userId: " + req.user.id + " username: " + req.user.username +
			"</b>" + "<p>message:" + req.body.msg + "</p>"// html body// html body
		};

		mailer.sendMail(mailOptions, function(err, response) {
			if (err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});

			} else {

				log.error("Message sent: " + response.message);
				res.json( errorResInfo.SUCCESS.code, {});

			}																		
		});		
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}
		
};


// GET Interface for get poi tags of user
exports.getPoiTags = function(req, res){

	PoiTag.find({

		userId: req.user._id

	}, function(err, poiTags){

		if(err) {

			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: i18n.__('error.500Error')
			});  				

        } else {

        	// Test data(TODO)
        	/*
        	var test = ["Apple","Orange","Banana","Watermelon","Grape","Lemon"];
        	if(poiTags.length == 0)
        		poiTags = test;

        	var newPoiTags = [];
        	for(var key in poiTags){
        		newPoiTags.push({"data" : poiTags[key]});
        	}

			res.json(errorResInfo.SUCCESS.code, newPoiTags);
			*/
			res.json(errorResInfo.SUCCESS.code, []);
		}

	});

}

