var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
	path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),		
	uuid = require('node-uuid'),
	Ad = require("../../model/ad"),
	Store = require("../../model/store"),
    Floor = require("../../model/floor"),
    Building = require("../../model/building"),
	User = require("../../model/user"),
	ResetPasswordToken = require("../../model/resetPasswordToken"),	
    mailer = require('../../config/nodemailerSetup'),
    config = require('../../config/config.js'),
    utilityS = require("../utility.js");

// Static variable
var errorResInfo = utilityS.errorResInfo,
	resource_path = "./resource/",
    public_image_path = "client-image",
    mapzip_path = resource_path + "mapzip",
    image_path = "public/" + public_image_path;

// Page for show all users
exports.index = function(req, res){

	res.render("admin-view/user/index.html", {
		url: req.url.toString(), // use in layout for identify display info
		user: req.user,
        imagePath: public_image_path,
        ROLES: User.ROLES
	});

};

// GET Interface for get all users
exports.list = function(req, res){

	// Pagination params
	var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;
	var queryJson = null;

    User.find(queryJson)
		.sort({ createdTime: -1 })
		.limit(config.pageOffset)
		.skip(page * config.pageOffset).exec( function(err, users){

        if(err){

            log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  		

		} else {

			// Get users count
			User.count( queryJson, function(err, count) {

				if( err ) {

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

			        res.send(errorResInfo.SUCCESS.code, {						        	
			        	page: page + 1,
			        	offset: config.pageOffset,
			        	count: count,
			        	users: users
			        });
	
				}

			} );			
    	
    	}

	});

};


// POST Interface for get all users
exports.create = function(req, res){

	if(req.body.username && req.body.password && req.body.role){

		var token;
		if(req.body.role == User.ROLES.ADMIN || req.body.role == User.ROLES.DEVELOPER )
			token = User.genToken();

		User.findOne({

			username: req.body.username

		}, function(err, user){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});

			} else {

				if(!user) {

					new User({

						username: req.body.username,
						password: User.encodePassword(req.body.password),
						role: req.body.role,
						enabled: true,
						token: token,
						createdTime: new Date()

					}).save(function(err, user){

				        if(err){

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  		

						} else {	

							res.json(errorResInfo.SUCCESS.code, user);

							// Start to create default building after response
							utilityS.createSampleBuilding(user);

						}

					});

				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: "Duplicate username"
					});

				}

			}

		})

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	}

};


// POST Interface for update user info
exports.update = function(req, res){

	if(req.body._id){

		User.findById(req.body._id, function(err, user){

			if(err){

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  					
			
			} else {

				if(user){

				    // Check upgrade user to "admin" or "developer" for get token
					if( (req.body.role == User.ROLES.ADMIN || req.body.role == User.ROLES.DEVELOPER) &&
					   user.role == User.ROLES.FREE)
					    user.token = User.genToken();
					user.role = req.body.role;
					user.enabled = req.body.enabled;
					user.save(function(err, user){
						
						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  					


						} else {

							res.json(errorResInfo.SUCCESS.code, user);

						}

					});

				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
					});

				}

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	}

};


// POST Interface for change password of specific user
exports.changePassword = function(req, res){
	
	if(req.body._id && req.body.password) {

		User.findById(req.body._id, function(err, user){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});

			} else {

				if(user){
											
					user.password = User.encodePassword(req.body.password);
					user.save(function(err, user){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});

						} else {

							res.send( errorResInfo.SUCCESS.code, user );

						}								

					});
					
				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
					});

				}

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	}

};


// GET Interface of delete specific building
exports.del = function(req, res) {

	if(req.body._id){
				
		User.findById( req.body._id, function(err, user){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});

			} else {

				user.remove( function(err){

					if(err){

						log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						});

					} else {

						// Remove user folder
						var folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + req.body._id;						
						fs.exists(folderPath, function(exist){

							// Find building
							Building.find({

								userId: req.body._id

							}, function(err, buildings){
								
								if(err){

									log.error(err);

								} else {

									for(var i=0; i<buildings.length; i++){

										var buildingId = buildings[i]._id;
										(function(building_id){

											Floor.find({

												buildingId: building_id

											}, function(err, floors){

												if(err) {

													log.error(err);

												} else {

													for(var j=0; j<floors.length; j++){

														var floorId = floors[j]._id;
														(function(floor_id){

															Store.find({

																floorId: floor_id

															}, function(err, stores){

																if(err) {

																	log.error(err);

																} else {

																	for(var k=0; k<stores.length; k++){

																		var storeId = stores[k]._id;
																		(function(store_id){

																			// Remove ad
																			Ad.remove({

																				storeId: store_id

																			}, function(err){

																				if(err)
																					log.error(err);

																			});	

																		}(storeId));

																		// Remove store
																		stores[k].remove(function(err){
																			if(err)
																				log.error(err);
																		});

																	}

																}

															});


														}(floorId));

														// Remove floor
														floors[j].remove(function(err){
															if(err)
																log.error(err);
														});	
															
													}

												}



											});

										}(buildingId));
										
										// Remove building
										buildings[i].remove(function(err){
											if(err)
												log.error(err);
										})	

									}

								}
								
							});

							// Delete the folder removed floor 
							if(exist)
								rimraf(folderPath, function(err){
									if(err)
										log.error(err);
								});	

							// Response
							res.send( errorResInfo.SUCCESS.code, {
								_id: req.body._id
							});
							
						});
												
					}

				});

			}

		} );
				
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});
		
	}
	
};
