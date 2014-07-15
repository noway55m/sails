var log = require('log4js').getLogger(),
	utilityS = require("./utility"),
	User = require("../model/user"),		
	Area = require("../model/area"),		
	Poi = require("../model/poi"),	
	PoiTag = require("../model/poiTag"),	
	fs = require('fs'),
	path = require('path'),
	mkdirp = require("mkdirp"),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo;


// GET Page for show specific area
exports.show = function(req, res) {
	res.render("area/area-show.html");
};


// GET Interface for list areas of specific user
// @params public list public area
exports.list = function(req, res) {

 	// Pagination params
	var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;

    // Check user role for check with administration permission
    var queryJson = null;
    if(req.user.role !== User.ROLES.ADMIN)
        queryJson = { userId: req.user.id };

    Area.find(queryJson)
		.sort({ createdTime: -1 })
		.limit(config.pageOffset)
		.skip(page * config.pageOffset).exec( function(err, areas){

        if(err){

            log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  		

		} else {

			// Get area count
			Area.count( queryJson, function(err, count) {

				if( err ) {

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

					// Get area's owner if admin
					if(req.user.role == User.ROLES.ADMIN){

						var ids = [];
						for(index in areas){
							var area = areas[index];
							ids.push(area.userId.toString());
						}

						console.log(ids);

						User.find({

						    '_id': { $in: ids }

						}, function(err, users){	

							if(err){

								log.error(err);

							} else {

								console.log(users);

								var nAreas = JSON.parse(JSON.stringify(areas));
								for(var j=0; j<ids.length; j++){
									var username = "";
									for(var n=0; n<users.length; n++){
										if(ids[j] == users[n].id.toString()){
											username = users[n].username;
											break;
										}
									}
									nAreas[j].userName = username;
								}

								console.log(nAreas);

						        res.json(errorResInfo.SUCCESS.code, {						        	
						        	page: page + 1,
						        	offset: config.pageOffset,
						        	count: count,
						        	areas: nAreas
						        });

							}
								
						});	

					} else {

				        res.json(errorResInfo.SUCCESS.code, {						        	
				        	page: page + 1,
				        	offset: config.pageOffset,
				        	count: count,
				        	areas: areas
						});    	

					}	

				}

			} );			
    	
    	}		

    });

};


// GET Interface for read specific area
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Area.findById(req.params._id, function(err, area) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				// check permission
				utilityS.validatePermission(req.user, area, Area.modelName, function(result) {

					if(result) {

						res.json(errorResInfo.SUCCESS.code, area);

					} else {

	        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
	        				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
	        			});

					}

				}, true);

			}
			
		});			
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}
	
};


// POST Interface for create the new poi
exports.create = function(req, res) {

	if (req.body.name) {

		new Area({

			name: req.body.name,
			userId: req.user._id,
		    createdTime: new Date(),
		    updatedTime: new Date() 			

		}).save(function(err, area){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {


				var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + area.userId,
					areaFolderPath = folderPath + "/" + area.id,
					buildingFolderPath = areaFolderPath + "/building",
					poiFolderPath = areaFolderPath + "/poi",
					resourcePath = folderPath + "/resource";

				// Create folder of area including tow subfolder "poi" and "building"	
				mkdirp(buildingFolderPath, function(err) {

					if(err) {

						log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						}); 

					} else {

						mkdirp(poiFolderPath, function(err) {

							if(err) {

								log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

							} else {

								mkdirp(resourcePath, function(err) {

									if(err) {

										log.error(err);
										res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
											msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
										}); 

									} else {

										res.json( errorResInfo.SUCCESS.code , area);	

									}

								});

							}

						});

					}

				});

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

};


// POST Interface for update poi
exports.update = function(req, res) {

	if(req.body._id) {

		Area.findById( req.body._id, function(error, area) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if(area) {

					// check permission
					utilityS.validatePermission(req.user, area, Area.modelName, function(result) {
					    
						if(result) {

						    area.name = req.body.name;
						    area.desc = req.body.desc;
						    area.updatedTime = new Date();
							area.save(function(err, area) {

								if (err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});

								} else {

									if (area) {

										var areaObj = formatObjectDate(area);
										res.json(errorResInfo.SUCCESS.code, areaObj);

									}

								}

							});
						
						} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
		        			});

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

// POST Interface of delete specific area 
exports.del = function(req, res){
	
	if(req.body._id){
		
		Area.findById( req.body._id, function(err, area) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(area) {
					
					// check permission
					utilityS.validatePermission(req.user, area, Area.modelName, function(result) {
	    						
						if(result) {

	    					area.remove(function(err) {

	    						if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

	    						} else {

	    							// Remove poi



	    							// Remove building


									res.json( errorResInfo.SUCCESS.code, {
										_id: req.body._id
									});					

	    						}

	    					});	 

						} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
		        			});

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

// POST Interface of upload image
exports.uploadImage = function(req, res) {

	if(req.body._id && req.files.image) {

		// Get file name and extension
		var fileName = req.files.image.name;
		var extension = path.extname(fileName).toLowerCase() === '.png' ? ".png" : null ||
						path.extname(fileName).toLowerCase() === '.jpg' ? ".jpg" : null ||
						path.extname(fileName).toLowerCase() === '.gif' ? ".gif" : null;

		// Check file format by extension
		if(extension) {

			var tmpPath = req.files.image.path;
			log.info("tmpPath: " + tmpPath);

			// Read file and prepare hash
			var md5sum = crypto.createHash('md5'),
				stream = fs.ReadStream(tmpPath);

			// Set target file name by hash the file
			var targetFileName;
			stream.on('data', function(d) {
				md5sum.update(d);
			});

			stream.on('end', function() {

				targetFileName = md5sum.digest('hex')  + extension;
				var targetPath = path.resolve(config.imagePath + "/" + targetFileName);
				log.info("targetPath: " + targetPath);

				Area.findById(req.body._id, function(error, area){

					if(error) {

		                log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						});

					} else {

						if( area ) {

			    			// Check permisssion
			    			utilityS.validatePermission(req.user, area, Area.modelName, function(result){

			    				if(result) {

									log.info("targetName: " + targetFileName);
									if(area.icon != targetFileName){

										log.info("Update");
										fs.rename(tmpPath, targetPath, function(err) {
											if(err){

												log.error(err);
								    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								    			});  

											}else{

												// Delete old image if exist
												if(area.icon){
													var oldImgPath = path.resolve(config.imagePath + "/" + area.icon);
													fs.unlink(oldImgPath, function(err){
														log.error(err);
													});
												}
												
												// Update building
												area.icon = targetFileName;
												area.save( function(err) {

													if( err ) {

										    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
										    			});  											

													} else {

														res.send( errorResInfo.SUCCESS.code, targetFileName );

													}

												});
												
												// Delete the temporary file
					                            fs.unlink(tmpPath, function(err){
					                            	log.error(err);
					                            });										
												
											}
										});								
										
									}else{

										log.info("Same");
										res.send( errorResInfo.SUCCESS.code, targetFileName );

									}

			    				} else {

		                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
		                			});		    					

			    				}

			    			});

						} else {

		        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
		        				msg: errorResInfo.INCORRECT_PARAMS.msg
		        			});  						

						}//end if

					}

				});

			});

		}else{

			res.json( errorResInfo.INCORRECT_FILE_TYPE.code, { 
				msg: "File extension should be .png or .jpg or gif" 
			});

		}

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});	

	}

};

// Post Interface for package area map zip
//		---> poi
// area-|
//		---> building --> floor
exports.packageMapzip = function(req, res){

}

// Interface for area map zip
exports.getMapzip = function(req, res){

}

// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	ibdObj.updatedTime = moment(ibd.updatedTime).format("YYYY/MM/DD HH:mm Z").toString();		
	return ibdObj;
	
}