var log = require('log4js').getLogger("Register"),
	fs = require('fs'),
	path = require('path'),
    User = require("../model/user"),
    Floor = require("../model/floor"),
    Building = require("../model/building"),    
	AccountActivateToken = require("../model/accountActivateToken"),	
	mailer = require('../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../config/config.js');

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
						        new Building({

						            name: "Sample",
						            desc: "You can customize your builiding by this sample",
						            userId: nuser.id,
						            pub: false,
						            icon: "building-sample-icon.png",
						            address: "Building address"
						            	
						        }).save(function(err, building){
						        	
						        	if(err){
						        		
						        		log.error(err);
						        		
						        	}else{
						        	
							            if(building){
													            	
											// Main Folder path
											var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + nuser.id,
												buildingFolderPath = folderPath + "/" + building.id,
												floorFolderPath = buildingFolderPath + "/1",
												clientImagePath = folderPath + "/client-image",
												samplePath = config.sampleBuildingPath + "/1";   
								 								
											// Make sure building folder path exist, if not created
											mkdirp(floorFolderPath, function(err, dd) {
												
												if(err){
													
													log.error(err);
													
												}else{
													
													// Make sure client-image folder path exist, if not created (TODO: for put user's images for future)
													mkdirp(clientImagePath, function(err, dd) {
														
														if(err){
															
															log.error(err);
															
														}else{
															
															// Get sample folder data
															fs.readdir(samplePath, function(err, files){
																
																if(err){
																	
																	log.error(err);
																	
																}else{
																	
																	
																	// Copy the default xml files and zip to floor folder of default building of user
																	for(var i=0; i<files.length; i++){
																		console.log(samplePath + "/" + files[i]);
																		fs.createReadStream( samplePath + "/" + files[i], {																
																			encoding: 'utf8',
																			autoClose: true																
																		}).pipe(fs.createWriteStream(floorFolderPath + "/" + files[i]));																					
																	}																		
																	
																	// Create new floor
																	new Floor({
																		
																		layer: 1,													
																		buildingId: building.id,
																		map: floorFolderPath + '/map.xml',
																		path: floorFolderPath + '/path.xml'
													
																	}).save(function(err, floor){																																											
																		if(err)
																			log.error(err);																		
																	});	
																																		
																}
																																																											
															});																								
																																													
														}
														
													});
													
												}
											
											});							            	
							            									            								            	
							            }// end if						        								        		
						        		
						        	}						        	

						        });								
																
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