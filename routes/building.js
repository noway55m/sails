var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
    mkdirp = require("mkdirp"),
	User = require("../model/user"),
    Building = require("../model/building"),
    Floor = require("../model/floor"),
    Store = require("../model/store"),    
    Ad = require("../model/ad"),    
    crypto = require('crypto'),
    AdmZip = require('adm-zip'),
    archiver = require('archiver'),
    rimraf = require('rimraf'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../config/config'),
	builder = require('xmlbuilder'),
	archiver = require('archiver'),
	ga = require('./googleAnalytics');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page for show specific building
exports.show = function(req, res) {
	res.render("building/building-show.html");
};

// Get Interface of list public buildings
exports.listPublic = function(req, res){

    Building.find({

        pub : true

    }, function(err, buildings) {

        if (err){

			log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  				

        } else {

	        res.json(errorResInfo.SUCCESS.code, buildings);

        }
            
    });

};

// GET Interface of list buildings or buildings of specific user
exports.list = function(req, res) {

    // Check user role for check with administration permission
    var queryJson = null;
    if(req.user.role !== User.ROLES.ADMIN)
        queryJson = { userId: req.user.id };

    Building.find(queryJson, function(err, buildings){

        if(err){

            log.error(err);
            res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
                    msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
            });                  

        } else {

            // Get building's owner if admin
            if(req.user.role == User.ROLES.ADMIN){

                var ids = [];
                for(index in buildings){
                        var building = buildings[index];
                        ids.push(building.userId.toString());
                }

                User.find({

                    '_id': { $in: ids }

                }, function(err, users){        

                        if(err){

                                log.error(err);

                        } else {

                                var nBuildings = JSON.parse(JSON.stringify(buildings));
                                for(var j=0; j<ids.length; j++){
                                        var username = "";
                                        for(var n=0; n<users.length; n++){
                                                if(ids[j] == users[n].id.toString()){
                                                        username = users[n].username;
                                                        break;
                                                }
                                        }
                                        nBuildings[j].userName = username;
                                }
                        res.send(errorResInfo.SUCCESS.code, nBuildings);

                        }
                                
                });        

            } else {

            	res.send(errorResInfo.SUCCESS.code, buildings);            

            }        
        
        }                

    });

};

// GET Interface of list buildings or buildings of specific user (new support pagination)
exports.listPage = function(req, res) {

	// Pagination params
	var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;

    // Check user role for check with administration permission
    var queryJson = null;
    if(req.user.role !== User.ROLES.ADMIN)
        queryJson = { userId: req.user.id };

    Building.find(queryJson)
		.sort({ createdTime: -1 })
		.limit(config.pageOffset)
		.skip(page * config.pageOffset).exec( function(err, buildings){

        if(err){

            log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  		

		} else {

			// Get buildings count
			Building.count( queryJson, function(err, count) {

				if( err ) {

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

					// Get building's owner if admin
					if(req.user.role == User.ROLES.ADMIN){

						var ids = [];
						for(index in buildings){
							var building = buildings[index];
							ids.push(building.userId.toString());
						}

						User.find({

						    '_id': { $in: ids }

						}, function(err, users){	

							if(err){

								log.error(err);

							} else {

								var nBuildings = JSON.parse(JSON.stringify(buildings));
								for(var j=0; j<ids.length; j++){
									var username = "";
									for(var n=0; n<users.length; n++){
										if(ids[j] == users[n].id.toString()){
											username = users[n].username;
											break;
										}
									}
									nBuildings[j].userName = username;
								}

						        res.send(errorResInfo.SUCCESS.code, {						        	
						        	page: page + 1,
						        	offset: config.pageOffset,
						        	count: count,
						        	buildings: nBuildings
						        });

							}
								
						});	

					} else {

				        res.send(errorResInfo.SUCCESS.code, {						        	
				        	page: page + 1,
				        	offset: config.pageOffset,
				        	count: count,
				        	buildings: buildings
						});    	

					}	

				}

			} );			
    	
    	}		

    });

};

// POST Interface of create new building
exports.create = function(req, res) {

    if(req.body.name){


    	Building.count({

    		userId: req.user._id

    	}, function( err, count ) {

	        if(err){

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  		

			} else {

				if(count <= config.maxBuildingNumberOfUser || user.role == User.ROLES.ADMIN ){

			        new Building({

			            name: req.body.name,
			            desc: req.body.desc,
			            userId: req.user._id,
			            pub: false,
			            createdTime: new Date()

			        }).save(function(err, building){

			        	if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  

			        	} else {

				            if(building){

				                res.send( errorResInfo.SUCCESS.code, building );

				            }else{

					            log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								});  

				            }// end if

			        	}

			        });

				} else {

					res.json( errorResInfo.BUILDING_OVER_LIMITATION_DENY.code , { 
						msg: errorResInfo.BUILDING_OVER_LIMITATION_DENY.msg
					});  

				}

			}

    	});

    }

};

// GET Interface for get building info
exports.read = function(req, res){

	if( req.params._id ){

	    // Get building
	    Building.findById(req.params._id, function(err, building) {

	        if( err ) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if( building ) {

		            // Check permission
		            utilityS.validatePermission( req.user, building, Building.modelName, function(result) {

		            	if(result) {

		            		res.json( errorResInfo.SUCCESS.code , building);

		        			// GA collect
		        			var title = building.name + "-" + building.userId;
						 	ga.measurementTool.pageTracking(req, title);

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
		        			});

		            	}

		            }, true);

				} else {

        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			});  

				}

			}

	    });

	}

};

// POST Interface of update specific building
exports.update = function(req, res) {

    if(req.body._id){
    	    	
        // Get building
        Building.findById(req.body._id, function(err, building){

            if(err){
            	
                log.error(err);
    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
    			});            	            	
                                
            }else{

                if(building){
                	
                	utilityS.validatePermission(req.user, building, Building.modelName, function(result){

                		if(result){
                			
                            building.name = req.body.name;
                            building.desc = req.body.desc;
                            building.pub = req.body.pub;
                            building.address = req.body.address;
                            building.save(function(err, buildingS){
                                
                            	if( err ) {

                            		log.error(err);
				        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				        			});                              		

                            	} else {

	                                // Auto-package mapzip     			
									utilityS.packageMapzip(buildingS._id, function(errorObj){

										if(errorObj.code != errorResInfo.SUCCESS.code){

											res.json(errorObj.code, {
												msg: errorObj.msg
											});

										}else{

											//res.json(errorObj.code, errorObj.building);
						        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						        			});  

										}

									});

                            	}

                            });            			
				           
                		}else{
                			
                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
                			});
                			
                		}         		
                		
                	});
                	
                }else{
                	
        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			});            	            	
                	                	
                }            	
            	            	
            }

        });

    }

};

// GET Interface of delete specific building
exports.del = function(req, res) {

	if(req.body._id){
				
		// Remove building folder
		var folderPath = path.dirname() + mapinfo_path + '/' + req.user._id + "/" + req.body._id,
			folderZipPath = folderPath + ".zip";
		
		fs.exists(folderPath, function(exist){

			// Delete the folder removed floor 
			if(exist)
				rimraf(folderPath, function(err){
					if(err)
						log.error(err);
				});	

			// Find building
			Building.findById(req.body._id, function(err, building){
				
				if(err)
					log.error(err);
				
				if(building){
					
					// Remove building icon
					if(building.icon){
						var oldImgPath = path.resolve(image_path + "/" + building.icon);
						fs.unlink(oldImgPath, function(err){
							log.error(err);
						});	
					}							
					
					// Remove building
					building.remove(function(err){
						if(err)
							log.error(err);
						else
							res.send(200, {
								_id: req.body._id
							});
							
					});
										
				}
				
			});
			
		});		
		

		// Remove building mapzip
		fs.exists(folderZipPath, function(exist){

			// Delete if exist
			if(exist)
				rimraf(folderZipPath, function(err){
					if(err)
						log.error(err);
				});	

		});

		// Find all floors
		Floor.find({
			
			buildingId: req.body._id
			
		}, function(err, floors){
			
			if(err)
				log.error(err);
			
			for(var i=0; i<floors.length; i++){
				
				Store.find({
					
					floorId: floors[i]._id
					
				}, function(err, stores){
					
					if(err)
						log.error(err);
					
					for(var j=0; j<stores.length; j++){		
						
						// Remove ad
						Ad.find({
							
							storeId: stores[j].id
							
						}, function(err, ads){					
							
							if(err)
								log.error(err);
							
							for(var k=0; k<ads.length; k++){
								
								// Delete ad image if exist
								if(ads[k].image){
									var oldImgPathAd = path.resolve(image_path + "/" + ads[k].image);
									fs.unlink(oldImgPathAd, function(err){
										log.error(err);
									});	
								}
								
								// Remove ad
								ads[k].remove(function(err){
									log.error(err);
								});						
								
							}
												
						});			
												
						// Delete store icon if exist
						if(stores[j].icon){
							var oldImgPath = path.resolve(image_path + "/" + stores[j].icon);
							fs.unlink(oldImgPath, function(err){
								log.error(err);
							});	
						}							
						
						// Remove store
						stores[j].remove(function(err){
							log.error(err);
						});
						
					}
					
				});
				
				// Remove floor
				floors[i].remove(function(err){
					log.error(err);
				});
				
			}
									
		});		
				
	}
	
};

// POST Interface of upload image
exports.uploadImage = function(req, res) {

	if(req.body._id && req.files.image){

		// Get file name and extension
		var fileName = req.files.image.name;
		var extension = path.extname(fileName).toLowerCase() === '.png' ? ".png" : null ||
						path.extname(fileName).toLowerCase() === '.jpg' ? ".jpg" : null ||
						path.extname(fileName).toLowerCase() === '.gif' ? ".gif" : null;

		console.log(extension);

		// Check file format by extension
		if(extension){

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

				Building.findById(req.body._id, function(error, building){

					if( building ) {

						log.info("icon: " + building.icon);
						log.info("targetName: " + targetFileName);
						if(building.icon != targetFileName){

							log.info("Update");
							fs.rename(tmpPath, targetPath, function(err) {
								if(err){

									log.error(err);
					    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					    			});  

								}else{

									// Delete old image if exist
									if(building.icon){
										var oldImgPath = path.resolve(config.imagePath + "/" + building.icon);
										fs.unlink(oldImgPath, function(err){
											log.error(err);
										});
									}
									
									// Update building
									building.icon = targetFileName;
									building.save( function(err) {

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

	        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
	        				msg: errorResInfo.INCORRECT_PARAMS.msg
	        			});  						

					}//end if

				});

			});

		}else{

			res.json( errorResInfo.INCORRECT_FILE_TYPE.code, { msg: "File extension should be .png or .jpg or gif" });

		}


	}

};

// Post Interface of upload beaconlist
exports.uploadBeaconlist = function(req, res){

	if( req.body._id && req.files.beaconlist ) {

		Building.findById( req.body._id, function( err, building ){

			if(err) {

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if( building ) {

	    			// Check permisssion
	    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

	    				if(result){

					        // Get the temporary location of the file
					        var tmpPathPath = req.files.beaconlist.path;

					        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
					        var webLocation = building.userId + "/" + building._id,
					            folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

					        // Make sure flolder exist    	        
				            mkdirp(folderPath, function(err, dd) {

				                if (err) {

				                    log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

				                } else {

					                var targetPathPath = folderPath + "/beaconlist.xml";
					                log.info("targetPathPath: " + targetPathPath);
					                	
					                fs.rename( tmpPathPath, targetPathPath, function(err) {

					                    if (err){

					                        log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
											}); 

					                    } else {

					                        res.send( errorResInfo.SUCCESS.code, {

					                        	msg: "Upload beaconlist file successfully"

					                        });

		                                	// Auto-package mapzip		                                
		                                	utilityS.packageMapzip(building._id, function(errorObj){});					                        

					                        // Delete temped path.xml
					                        fs.unlink( tmpPathPath, function(err){} );

					                    }	                   

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

	                log.error(err);
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


// Function for package map zip of all floors in specific building
exports.packageMapzip = function(req, res){
	
	if(req.body._id){
		
		utilityS.packageMapzip(req.body._id, function(errorObj){

			if(errorObj.code != errorResInfo.SUCCESS.code){

				res.json(errorObj.code, {
					msg: errorObj.msg
				});

			}else{

				res.json(errorObj.code, errorObj.building);

			}

		});
		
	} else {
		
		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});			
		
	}
	
};


// Function for get map zip of all building
exports.getMapzip = function(req, res){
	
    if(req.query.mapzip){
    	
        try{
        	
            var fileName = req.query.mapzip,
	            filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName,
	            stat = fs.statSync(filePath);
            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=map.zip",
                "Content-Length": stat.size
            });

            var readStream = fs.createReadStream(filePath);

            // We replaced all the event handlers with a simple call to util.pump()
            readStream.pipe(res);

        }catch(e){

            log.error(e);
            res.json(400, {
            	msg: "file doesn't exist"
            });             

        }
    }
	
};
