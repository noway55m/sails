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
	utilityS = require("./utility.js");

// GET Register page
exports.index = function(req, res) {
	res.render("register/index.html", {
		url : req.url.toString(), // use in layout for identify display info
		errorMsg : req.flash('msg') || ""
	});
};

// GET Interface for authenticate and register new user
exports.auth = function(req, res) {
	
    if(req.body.email && req.body.password){
    
        var email = req.body.email.trim().toLowerCase(),
            passwd = req.body.password.trim();

        // Check duplicate user
        User.findOne({

            username : email

        }, function(err, user){
        
            if(err)
                log.error(err);

            if(user){

                req.flash('msg', "The email has been registered already.");
                res.redirect("/register");

            }else{
            
                new User({
            	
					username : email,
					password : User.encodePassword(passwd)

				}).save(function(err, nuser) {

					if (err)
						log.error(err);

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
									subject : "Welcome join to Sails Cloud Service", // Subject line
									text : "Welcome join to Sails Cloud Service", // plaintext body
									html : "<b>Welcome join to Sails Cloud Service. Please click following link to activate your account:</b>" +
											"<a href='" + config.domainUrl + "/register/activate/" + atoken.token + "'>Activate</a>" // html body// html body
								};

								mailer.sendMail(mailOptions, function(error, response) {
									if (error) {
										log.error(error);
									} else {
										log.error("Message sent: " + response.message);
									}																		
								});
								
								// Redirect to index page
								req.flash('activate', "Please check your email address for activate your user account.");
								res.redirect("/");
								
								// Start to create default building after response
								utilityS.createSampleBuilding(nuser);
																													
							}
							
						});

					}
					
				});

            }

        });

    }

};

// Interface for activate user account
exports.activate = function(req, res) {
	
	if(req.params.token){
		
		AccountActivateToken.findOne({
			
			token: req.params.token
			
		}, function(err, token){
			
			if(err)
				log.error(err);
			
			if(token){
				
				User.findById(token.userId, function(err, user){
					
					if(err)
						log.error(err);
					
					if(user){
						
						user.enabled = true;
						user.save(function(err){
							
							if(err){
								log.error(err);
							}else{
								
								token.remove(function(err){
									log.error(err);
								});
								
								req.flash('activate', "Activate Successfully");
								res.redirect('/');
							}
							
						});
						
					}
					
				});
				
			}
			
		});
				
	}
	
};