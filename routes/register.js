var log = require('log4js').getLogger("Register"),
	fs = require('fs'),
	path = require('path'),
    User = require("../model/user"),
    Floor = require("../model/floor"),
    Building = require("../model/building"),    
	AccountActivateToken = require("../model/accountActivateToken"),	
	mailer = require('../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../config/config.js'),
	utilityS = require("./utility.js"),
	recaptcha = require("./googleRecaptcha.js"),
	i18n = require("i18n");


// GET Register page
exports.index = function(req, res) {

	res.render("register/index.html", {
		url : req.url.toString(), // use in layout for identify display info
		errorMsg : req.flash('msg') || "",
		user: null,
		recaptchaPublicKey: config.recaptchaPublicKey
	});
};

// GET Interface for authenticate and register new user
exports.auth = function(req, res) {
	
    if(req.body.email && req.body.password) {

    	// TODO: Hide google recaptcha for now (Since china people can not connect google)
    	// && req.body.recaptcha_challenge_field && req.body.recaptcha_response_field){
    	
    	// TODO: Hide google recaptcha for now (Since china people can not connect google)
		//recaptcha.verify(config.recaptchaPrivateKey , req.connection.remoteAddress, req.body.recaptcha_challenge_field, 
		//	req.body.recaptcha_response_field, function(result) {

			var result = "success";
			if(result.indexOf("success")!=-1) {

		        var email = req.body.email.trim().toLowerCase(),
		            passwd = req.body.password.trim();

		        // Check duplicate user
		        User.findOne({

		            username : email

		        }, function(err, user){
		        
		            if(err) {

		                req.flash('msg', i18n.__('register.errorMsg.serverError'));
		                res.redirect("/register");

		            } else {

			            if(user) {

			            	log.error(err);
			                req.flash('msg', i18n.__('register.errorMsg.duplicateEmail'));
			                res.redirect("/register");

			            } else {
			            
			                new User({
			            	
								username : email,
								password : User.encodePassword(passwd),
								token : User.genToken()

							}).save(function(err, nuser) {

								if (err) {

									log.error(err);
					                req.flash('msg', i18n.__('register.errorMsg.serverError'));
					                res.redirect("/register");

								} else {

									if (nuser) {
										
										new AccountActivateToken({
									
											token: User.genToken(),							
											userId: nuser.id,
											createdAt: new Date()
											
										}).save(function(err, atoken){
											
											if(err)
												log.error(err);
											
											if(atoken){
												
												// Send mail with defined transport object
												var mailOptions = {
													from : mailer.defaultOptions.from, // sender address
													to : email, // list of receivers
													subject : i18n.__('register.activeEmail.title'), // Subject line
													text : i18n.__('register.activeEmail.title'), // plaintext body
													html : i18n.__('register.activeEmail.title', { domainUrl: config.domainUrl, token: atoken.token }) // html body// html body
												};

												mailer.sendMail(mailOptions, function(error, response) {
													if (error) {
														log.error(error);
													} else {
														log.error("Message sent: " + response.message);
													}																		
												});
												
												// Redirect to index page
												req.flash('activate', i18n.__('register.errorMsg.activeEmailNotify'));
												res.redirect("/");
												
												// Create mapinfo resource folder
												utilityS.createMapinfoResourceFolder(nuser, function(){

													// Start to create default building after response
													utilityS.createSampleBuilding(nuser);

												});
																																	
											}
											
										});

									}

								}							
								
							});

			            }

		            }		                

		        });

			} else {

                req.flash('msg', i18n.__('register.errorMsg.verificationCodeIncorrect'));
                res.redirect("/register");

			}

		//});

    }

};

// Interface for activate user account
exports.activate = function(req, res) {
	
	if(req.params.token){
		
		AccountActivateToken.findOne({
			
			token: req.params.token
			
		}, function(err, token){
			
			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});					
			
			} else {

				if(token){
					
					User.findById(token.userId, function(err, user){
						
						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});					

						} else {

							if(user) {
								
								user.enabled = true;
								user.save(function(err){
									
									if(err) {

										log.error(err);
										res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
											msg: i18n.__('error.500Error')
										});										

									} else {
										
										token.remove(function(err){
											log.error(err);
										});
										
										req.flash('activate', "Activate Successfully");
										res.redirect('/');
									}
									
								});
								
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

			}	
			
		});
				
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		});  

	}
	
};