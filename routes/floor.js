var log = require('log4js').getLogger(),
	utilityS = require("./utility.js"),		
	Ap = require("../model/ap"),
	ApToFloor = require("../model/apToFloor"),	
	Ad = require("../model/ad"),
	Store = require("../model/store"),
    Floor = require("../model/floor"),
    Building = require("../model/building"),
    fs = require('fs'),
	path = require('path'),
	mkdirp = require("mkdirp"),
    AdmZip = require('adm-zip'),
    rimraf = require('rimraf'),
	parseString = require('xml2js').parseString,
	config = require('../config/config');
	

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page of specific building
exports.show = function(req, res) {
	res.render("floor/floor-show.html", {
		maxFloorNumber: config.maxFloorNumber,
		maxBasementNumber: config.maxBasementNumber
	});
};

// GET Interface for read specific floor
exports.read = function(req, res) {

	if(req.params._id){

		// Get floor
		Floor.findById(req.params._id, function(err, floor) {

			if (err){

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 			
			
			} else {

				if (floor) {

	    			utilityS.validatePermission(req.user, floor, Floor.modelName, function(result) {

			    		if(result){

			    			res.send( errorResInfo.SUCCESS.code, floor );

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

// GET Interface for list floors of specific building
exports.list = function(req, res) {

	if(req.query.buildingId) {

		Building.findById(req.query.buildingId, function(err, building){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(building) {

	    			utilityS.validatePermission(req.user, building, Building.modelName, function(result) {

	    				if(result) {

							Floor.find({

								buildingId: building._id

							}).sort({layer: -1}).execFind(function(err, floors){

								if (err){

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 	

								} else {

									res.json(errorResInfo.SUCCESS.code, floors);

								}

							});

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

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});  

	}		

};

// POST Interface for create floor of building
exports.create = function(req, res) {

	if(req.body.buildingId && req.body.layer) {

		Building.findById( req.body.buildingId, function(error, building) {
			
			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( building ) {

	    			// Check permisssion
	    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

	    				if(result) {

							var layer;
							var sortOrder = req.body.layer > 0 ? -1 : 1;
							Floor.findOne({ buildingId: building.id})
								.sort({ layer: sortOrder })
								.select('layer')
								.exec(function(err, tfloor){

								if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

								} else {

									var nextLayer = tfloor && tfloor.layer ? tfloor.layer : 0;
									if( (req.body.layer<0 && nextLayer > 0) ||
										(req.body.layer>0 && nextLayer < 0 ) )
										nextLayer = 0;									
									
									if(req.body.layer > 0) {
										nextLayer++;
										building.upfloor = nextLayer;										
									} else {
										nextLayer--; 	
										building.downfloor = nextLayer;										
									}									
									layer = nextLayer;

									if( layer > config.maxFloorNumber ) {

										res.json( errorResInfo.FLOOR_OVER_LIMITATION_DENY.code , { 
											msg: errorResInfo.FLOOR_OVER_LIMITATION_DENY.msg
										}); 	

									} else if ( -(layer) > config.maxBasementNumber ) {

										res.json( errorResInfo.BASEMENT_OVER_LIMITATION_DENY.code , { 
											msg: errorResInfo.BASEMENT_OVER_LIMITATION_DENY.msg
										}); 	

									} else {

										building.save( function( err, building ) {
											
											if( err ) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 	

											} else {

												new Floor({
								
													layer: layer,
								
													buildingId: building._id
								
												}).save(function(error, floor){
														
													if(error) {

														log.error(error);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 	

													} else {

														res.send( errorResInfo.SUCCESS.code, floor );

						                                var floorFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId + "/" + building.id + "/" + layer;

						                                // Create floor's folder
						                                mkdirp(floorFolderPath, function(err, dd) {

						                                	if(err)
						                                		log.error(err);

						                                	// Auto-package mapzip		                                
						                                	utilityS.packageMapzip(building._id, function(errorObj){});

						                                });										

													}

												});	

											}				
											
										});

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

// POST Interface for update floor of building
exports.update = function(req, res) {

    if(req.body._id){

        // Get building
        Floor.findById(req.body._id, function(err, floor){

            if(err){
            
                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 	

            } else {

	            if( floor ) {
	                
	            	Building.findById(floor.buildingId, function(err, building){

	            		if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	            		} else {

			    			// Check permisssion
			    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

			    				if(result){

			    					// temp original layer
			    					var oriLayer = floor.layer;
			    					if( oriLayer != req.body.layer) {

			    						// Change folder name
			    						var oriFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId + "/" + building.id +
			    							"/" + oriLayer;
			    						var newFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId + "/" + building.id +
			    							"/" + req.body.layer;	
			    						fs.rename(oriFolderPath, newFolderPath, function(err) {

			    							if(err) {

								                log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

			    							} else {

								                floor.name = req.body.name;
								                floor.desc = req.body.desc;
								                floor.layer = req.body.layer;
								                floor.save(function(err, floor){

								                	if( err ) {

										                log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 

								                	} else {

								                		// Update top floor and buottom basement
								                		if(req.body.layer > building.upfloor || req.body.layer < -building.downfloor) {

									                		if(req.body.layer > building.upfloor)
									                			building.upfloor = req.body.layer;

									                		if(req.body.layer < -building.downfloor)
									                			building.downfloor = req.body.layer;

									                		building.save(function(err, building){
									                			if(err) 
									                				log.error(err);
									                		});

								                		}

									                    res.json(errorResInfo.SUCCESS.code, floor);

									                    // Auto-package mapzip
									                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

								                	}

								                });

			    							}

			    						});	

			    					}

			    				} else {

		                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
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

            }

        });

    }

};


// POST Interface for delete the floor, stores in this floor and ads of stores of this floor
exports.del = function( req, res ) {
	
	if(req.body._id) {
				
		// Remove floor
		Floor.findById( req.body._id, function( err, floor ) {
			
			if( err ) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if(floor){

					// Get floor's building					
					Building.findById(floor.buildingId, function(err, building){
					
						if(err){

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 				
						
						} else {

							if(building){
								
				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

										var folderPath = path.dirname() + mapinfo_path + '/' + building.userId + "/" + building.id;
																													
										// Remove removed floor folder if exist
										var removeFolderPath = folderPath + "/" + floor.layer;
										fs.exists(removeFolderPath, function(exist){
											
											// Delete the folder of removed floor 
											if(exist)
												rimraf(removeFolderPath, function(err){
													if(err)
														log.error(err);
												});										
																						
										});																		
																																																	
										// Remove floor
										var floorLayer = floor.layer;
										console.log(floorLayer);
										floor.remove(function(err){	
																	
											if( err ) {
												
												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 				

											} else {

												// Update building
												if(floorLayer == building.upfloor || floorLayer == -building.downfloor) {
													
													var sortOrder = floorLayer > 0 ? -1 : 1;
													Floor.findOne({ buildingId: building.id})
														.sort({ layer: sortOrder })
														.select('layer')
														.exec(function(err, tfloor){

														if(err) {

															log.error(error);

														} else {

															var clayer = tfloor && tfloor.layer ? tfloor.layer : 0;
															if( (floorLayer<0 && clayer > 0) ||
																(floorLayer>0 && clayer < 0 ) )
																clayer = 0;									
															
															if(floorLayer<0)
																building.downfloor = clayer;
															else	
																building.upfloor = clayer;

															building.save( function( err, building ) {
																
																if( err ) {

																	log.error(err);
																	res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																		msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																	}); 	

																}

															});
													
														}

													});

												}											
												
												res.json(errorResInfo.SUCCESS.code, {
													_id: req.body._id
												});

												// Find all stores of removed floor
												Store.find({
													
													floorId: req.body._id
													
												}, function(err, stores){
													
													if(err)
														log.error(err);
													
													for(var i=0; i<stores.length; i++){					
														
														// Find all ads
														Ad.find({
															
															storeId: stores[i].id
															
														}, function(err, ads){					
															
															if(err)
																log.error(err);
															
															for(var j=0; j<ads.length; j++){
																
																// Delete ad image if exist
																if(ads[j].image){
																	var oldImgPathAd = path.resolve(image_path + "/" + ads[j].image);
																	fs.unlink(oldImgPathAd, function(err){
																		log.error(err);
																	});	
																}
																
																// Remove ad
																ads[j].remove();						
																
															}
																				
														});				
														
														// Delete store icon if exist
														if(stores[i].icon){
															var oldImgPath = path.resolve(image_path + "/" + stores[i].icon);
															fs.unlink(oldImgPath, function(err){
																log.error(err);
															});	
														}				
														
														// Remove store
														stores[i].remove();
														
													}		
													
												});

											}

											// Auto-package mapzip
											utilityS.packageMapzip(building._id, function(errorObj){});

										});		
																						
				    				} else {

			                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
			                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
			                			});

				    				}

				    			});
																			
							} else {

								log.error("The building of floor: " + floor.buildingId + " is null");
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

							}

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


// POST Interface for upload path.xml and map.xml
exports.uploadMapAndPath = function(req, res) {

	if(req.body._id && req.files.map){

	    Floor.findById(req.body._id, function(err, floor) {
			
	    	if (err) {

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});   

	    	} else {

	    		if(floor) {

	    			Building.findById( floor.buildingId, function(err, building) {

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});   

	    				} else {

	    					if(building) {

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

								        // Get the temporary location of the file
								        var tmpPathPath = req.files.path ? req.files.path.path : null,
								            tmpPathMap = req.files.map.path;

								        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
								        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
								            folderPath = path.dirname() + mapinfo_path + '/' + webLocation;	        
							            mkdirp(folderPath, function(err, dd) {

							                if (err)
							                    log.error(err);

							                var targetPathPath = folderPath + "/path.xml",
							                    targetPathMap = folderPath + "/map.xml";

							                log.info("targetPathPath: " + targetPathPath);
							                log.info("targetPathMap: " + targetPathMap);

							                // Move file from temp to target
							                fs.rename(tmpPathMap, targetPathMap, function(err) {

							                    if (err){
							                    	
							                        log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
													});   		                        
							                        
							                    }else{
							                    	
							                    	// Update map
							                    	floor.map = webLocation + "/map.xml";
							                        if(tmpPathPath){
							                        	
							                            fs.rename(tmpPathPath, targetPathPath, function(err) {

							                                if (err)
							                                    log.error(err);
							                                
							                                // Update floor
							                                floor.path = webLocation + "/path.xml";                                
							                                floor.lastXmlUpdateTime = new Date();                        
							                                floor.save(function(err, floor) {

							                                    if (err)
							                                        log.error(err);

							                                    if (floor)
							                                        res.json(errorResInfo.SUCCESS.code, floor);

							                                    // Delete temped path.xml
							                                    fs.unlink(tmpPathPath, function(err){});

							                                });

							                            });                    	
							                        	                    	
							                        }else{
							                        	
							                        	// Update floor
							                        	floor.lastXmlUpdateTime = new Date(); 
							                            floor.save(function(err, floor) {

							                                if (err){

							                                	log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});   

							                                } else {

							                                	res.send( errorResInfo.SUCCESS.code, floor );

							                                }
							                                    
							                                // Delete temped map.xml
							                                fs.unlink(tmpPathMap, function(err){});

										                    // Auto-package mapzip
										                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

							                            });
							                            
							                        }                    	
							                    	
							                    }
							                    
							                    // Delete temped map.xml
							                    fs.unlink(tmpPathMap, function(err){});

							                });

							            });

				    				} else {

			                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
			                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
			                			});

				    				}

				    			});	    						

	    					} else {

								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

	    				}

	    			});

	    		} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
					}); 

	    		}

	    	}

	    });

	}

};


// POST Interface for upload render.xml and region.xml
exports.uploadRenderAndRegion = function(req, res) {

	if(req.body._id && req.files.render && req.files.region){

	    Floor.findById(req.body._id, function(err, floor) {

	    	if(err) {

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});   	    		

	    	} else {

	    		if(floor) {

				    Building.findById( floor.buildingId, function(err, building) {

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});   

	    				} else {

	    					if(building) {

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

							            // Get the temporary location of the file
							            var tmpPathRender = req.files.render.path,
							                tmpPathRegion = req.files.region.path;

							            // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
							            var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
							                folderPath = path.dirname() + mapinfo_path + '/' + webLocation;

							            mkdirp(folderPath, function(err, dd) {

							                if (err)
							                    log.error(err);

							                var targetPathRender = folderPath + "/render.xml",
							                    targetPathRegion = folderPath + "/region.xml";

							                log.info("targetPathRender: " + tmpPathRender);
							                log.info("targetPathRegion: " + tmpPathRegion);

							                // Move file from temp to target
							                fs.rename(tmpPathRender, targetPathRender, function(err) {

							                    if (err){
							                    	
							                        log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
													});   
							                        
							                    }else{
							                    	
								                    fs.rename(tmpPathRegion, targetPathRegion, function(err) {
								
								                        if (err) {

									                        log.error(err);
															res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
															}); 

								                        } else {

									                        floor.render = webLocation + "/render.xml";
									                        floor.region = webLocation + "/region.xml";
									                        floor.lastXmlUpdateTime = new Date(); 
									                        floor.save(function(err, floor) {
									
									                            if (err) {

											                        log.error(err);
																	res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																		msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																	}); 

									                            } else {

										                            res.send( errorResInfo.SUCCESS.code, floor);

												                    // Auto-package mapzip
												                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

										                            // Start to parse region.xml
										                            fs.readFile(targetPathRegion, 'utf8', function (err, data) {
										
										                                if(err)
										                                  log.error(err);
										
										                                if(data)
										                                	utilityS.parseRegion(data, req.body._id)
										
										                                // Delete the temporary file
										                                fs.unlink(tmpPathRender, function(err){});
										                                fs.unlink(tmpPathRegion, function(err){});
										                            });

									                            }								
									
									                        });

								                        }
								
								                    });
								                    
							                    }

							                });

							            });

				    				} else {

			                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
			                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
			                			});

				    				}

				    			});	    						

	    					} else {

								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

	    				}

	    			});


	    		} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
					}); 

	    		}

	    	}

	    });

	}

};

// GET Interface for get mapzip file of specific building
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

// GET Interface for get region.xml
exports.getFile = function(req, res){
	
	if(req.query.map || req.query.path || req.query.render || req.query.region){
		
		// Get file name
		var fileName, resFileName;
		if(req.query.map){			
			fileName = req.query.map;
			resFileName = "map.xml";			
		}else if(req.query.path){			
			fileName = req.query.path;
			resFileName = "path.xml";
		}else if(req.query.render){			
			fileName = req.query.render;
			resFileName = "render.xml";						
		}else{			
			fileName = req.query.region;
			resFileName = "region.xml";						
		}
        var filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName;
        try{
        	
	        var stat = fs.statSync(filePath);
            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=" + resFileName,
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

// POST Interface for upload mapzip
exports.uploadMapzip = function(req, res) {
	
    if(req.body._id && req.files.mapzip){
    	    	
        // Get file name and extension
        var fileName = req.files.mapzip.name,
            extension = path.extname(fileName).toLowerCase() === '.zip' ? ".zip" : null ||
                        path.extname(fileName).toLowerCase() === '.rar' ? ".rar" : null;

        // Check file format by extension
        if(extension){

            // Get floor
            Floor.findById(req.body._id, function(err, floor) {

                if(err){

                    log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});                      

				} else {

	                if(floor){

	                    // Get the temporary location of the file
	                    var tmpPath = req.files.mapzip.path;

	                    // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
	                    Building.findById( floor.buildingId, function(err, building) {

	                    	if(err){

				                log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								});                     		

	                    	} else {

	                    		if( building ) {

					    			// Check permisssion
					    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

					    				if(result){

						                    var webLocation = building.userId + "/" + building._id + "/" + floor.layer,
						                        folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

						                    mkdirp(folderPath, function(err, dd) {
						                    	
						                        var targetPath = folderPath + "/map" + extension;
						                        		                        
						                        fs.rename(tmpPath, targetPath, function(err) {

						                            if (err) {

						                                log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														});   						                                                            
						                            
						                            } else {

							                            floor.mapzip = webLocation + "/map" + extension;
							                            floor.save(function(err, floor) {

							                                if (err) {

							                                    log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});   							                                    

							                                 } else {

							                                 	res.json( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});
							                                 
							                                 }   

							                                // Delete the temporary file
							                                fs.unlink( tmpPath, function(err){} );

							                            });

						                            }

						                        });

						                    });

					    				} else {

				                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
				                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
				                			});

					    				}

					    			});                    			

	                    		} else {

					                log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

	                    		}

	                    	}

	                    });

	                } else {

						res.json( errorResInfo.INCORRECT_PARAMS.code , { 
							msg: errorResInfo.INCORRECT_PARAMS.msg
						}); 

	                }

				}

            });

        }else{

            res.send( errorResInfo.SUCCESS.code, { msg: "File extension should be .zip or .rar." } );
        }

    }

};


// POST Interface for upload btlezip
exports.uploadBtlezip = function(req, res) {
	
    if(req.body._id && req.files.btlezip){
    	    	
        // Get file name and extension
        var fileName = req.files.btlezip.name,
            extension = path.extname(fileName).toLowerCase() === '.zip' ? ".zip" : null ||
                        path.extname(fileName).toLowerCase() === '.rar' ? ".rar" : null;

        // Check file format by extension
        if(extension){

            // Get floor
            Floor.findById(req.body._id, function(err, floor) {

                if(err){

                    log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});                      

				} else {

	                if(floor){

	                    // Get the temporary location of the file
	                    var tmpPath = req.files.btlezip.path;

	                    // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
	                    Building.findById( floor.buildingId, function(err, building) {

	                    	if(err){

				                log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								});                     		

	                    	} else {

	                    		if( building ) {

					    			// Check permisssion
					    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

					    				if(result){

						                    var webLocation = building.userId + "/" + building._id + "/" + floor.layer,
						                        folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

						                    mkdirp(folderPath, function(err, dd) {
						                    	
						                        var targetPath = folderPath + "/btle" + extension;
						                        		                        
						                        fs.rename(tmpPath, targetPath, function(err) {

						                            if (err) {

						                                log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														});   						                                                            
						                            
						                            } else {

							                            floor.btlezip = webLocation + "/btle" + extension;
							                            floor.save(function(err, floor) {

							                                if (err) {

							                                    log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});   							                                    

							                                 } else {

							                                 	res.send( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});
							                                 
							                                 }   

							                                // Delete the temporary file
							                                fs.unlink( tmpPath, function(err){} );

							                            });

						                            }

						                        });

						                    });

					    				} else {

				                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
				                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
				                			});

					    				}

					    			});                    			

	                    		} else {

					                log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

	                    		}

	                    	}

	                    });

	                } else {

						res.json( errorResInfo.INCORRECT_PARAMS.code , { 
							msg: errorResInfo.INCORRECT_PARAMS.msg
						}); 

	                }

				}

            });

        }else{

            res.send( errorResInfo.SUCCESS.code, { msg: "File extension should be .zip or .rar." } );
        }

    }

};


// Post Interface for upload applist.xml
exports.uploadAplist = function(req, res) {
	
	if(req.body.floorId && req.files.aplist){
		
		var fileName = req.files.aplist.name, 
			extension = path.extname(fileName).toLowerCase() === '.xml' ? ".xml" : null;
		
		// Check file type		
		if (extension) {
			
			Floor.findById(req.body.floorId, function(err, floor){
				
				if(err){
					
					log.error(err);
					
					// Internal server error
					res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
					});				
					
				}else{
									
					if(floor){
				        
				        Building.findById( floor.buildingId, function(err, building) {

	                    	if(err){

				                log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								});                     		

	                    	} else {

	                    		if( building ) {

					    			// Check permisssion
					    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

					    				if(result){

									        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
									        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
									            folderPath = path.dirname() + mapinfo_path + '/' + webLocation;
									        
									        mkdirp(folderPath, function(err, dd) {
									            
									        	if (err){
									        		
									                log.error(err);
													res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
														msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
													});					        		
									        		
									        	}else{
									        		
										            var tmpPathAppList = req.files.aplist.path,					        	
										            	targetPathAppList = folderPath + "/applist.xml";

										            log.info("targetPathAppList: " + targetPathAppList);

										            // Move file from temp to target
										            fs.rename(tmpPathAppList, targetPathAppList, function(err) {

										                if (err){
										                	
											                log.error(err);
											                
															// Internal server error
															res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
																msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
															});	
										                    
										                }else{
									                        	
									                        floor.applist = webLocation + "/applist.xml";
									                        floor.save(function(err, floor) {

									                            if(err){
									                            	
													                log.error(err);										                
													                
																	// Internal server error
																	res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
																		msg: errorResInfo.INTERNAL_SERVER_ERROR.msg 
																	});	
									                            							                            	
									                            }else{
									                            	
									                            	// Response success to client first						                            	
																	res.json(errorResInfo.SUCCESS.code, floor);
																	
										                            // Start to parse region.xml
										                            fs.readFile(targetPathAppList, 'utf8', function (err, data) {

										                                if(err)
										                                  log.error(err);
										                                
										                                if(data)
										                                    parseApplist(data, floor.id);

										                                // Delete the temporary file
										                                fs.unlink(tmpPathAppList, function(err){});
										                                
										                            });						                            	
									                            							                            	
									                            }						                              

									                        });					                        	
										                    
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

									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});   

	                    		}

	                    	}

				        });      														
						
					}else{
						
						// floorId is not correct
						res.send(errorResInfo.INCORRECT_PARAMS.code, {
							msg: errorResInfo.INCORRECT_PARAMS.msg 
						});						
						
					}		        
								
				}
					
			});					
						
		}else{

			// file is not xml type
			res.send(errorResInfo.INCORRECT_FILE_TYPE.code, {
				msg : errorResInfo.INCORRECT_FILE_TYPE.msg + " - applist have to be .xml format"
			});

		}			
				
	}else{
		
		// params is incorrect
		res.send(errorResInfo.INCORRECT_PARAMS.code, {
			msg: errorResInfo.INCORRECT_PARAMS.msg 
		});
		
	}

};


// POST Interface for upload map.xml
exports.uploadMap = function(req, res) {

	if(req.body._id && req.files.map){

	    Floor.findById(req.body._id, function(err, floor) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(floor){

	    			Building.findById( floor.buildingId, function( err, building ){

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	    				} else {

	    					if( building ){

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

								        // Get the temporary location of the file
								        var tmpPathPath = req.files.map.path;

								        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
								        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
								            folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

								        // Make sure flolder exist    	        
							            mkdirp(folderPath, function(err, dd) {

							                if (err){

							                    log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

							                } else {

								                var targetPathPath = folderPath + "/map.xml";
								                log.info("targetPathPath: " + targetPathPath);
								                	
								                fs.rename(tmpPathPath, targetPathPath, function(err) {

								                    if (err){

								                        log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 

								                    } else {

									                    // Update floor
									                    floor.lastXmlUpdateTime = new Date();
									                    floor.map = webLocation + "/map.xml";                                
									                    floor.save(function(err, floor) {

									                        if (err){

									                            log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});						                            
									                        
									                        } else {

										                        res.send( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

									                        }		                          

									                        // Delete temped path.xml
									                        fs.unlink( tmpPathPath, function(err){} );

									                    });

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
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

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

// POST Interface for upload path.xml
exports.uploadPath = function(req, res) {

	if(req.body._id && req.files.path){

	    Floor.findById(req.body._id, function(err, floor) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(floor){

	    			Building.findById( floor.buildingId, function( err, building ){

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	    				} else {

	    					if( building ){

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

								        // Get the temporary location of the file
								        var tmpPathPath = req.files.path.path;

								        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
								        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
								            folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

								        // Make sure flolder exist    	        
							            mkdirp(folderPath, function(err, dd) {

							                if (err){

							                    log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

							                } else {

								                var targetPathPath = folderPath + "/path.xml";
								                log.info("targetPathPath: " + targetPathPath);
								                	
								                fs.rename(tmpPathPath, targetPathPath, function(err) {

								                    if (err){

								                        log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 

								                    } else {

									                    // Update floor
									                    floor.lastXmlUpdateTime = new Date();
									                    floor.path = webLocation + "/path.xml";                                
									                    floor.save(function(err, floor) {

									                        if (err){

									                            log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});						                            
									                        
									                        } else {

										                        res.send( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

									                        }		                          

									                        // Delete temped path.xml
									                        fs.unlink( tmpPathPath, function(err){} );

									                    });

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
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

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

// POST Interface for upload render.xml
exports.uploadRender = function(req, res) {

	if(req.body._id && req.files.render){

	    Floor.findById(req.body._id, function(err, floor) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(floor){

	    			Building.findById( floor.buildingId, function( err, building ){

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	    				} else {

	    					if( building ){

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

								        // Get the temporary location of the file
								        var tmpPathPath = req.files.render.path;

								        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
								        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
								            folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

								        // Make sure flolder exist    	        
							            mkdirp(folderPath, function(err, dd) {

							                if (err) {

							                    log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

							                } else {

								                var targetPathPath = folderPath + "/render.xml";
								                log.info("targetPathPath: " + targetPathPath);
								                	
								                fs.rename(tmpPathPath, targetPathPath, function(err) {

								                    if (err){

								                        log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 

								                    } else {

									                    // Update floor
									                    floor.lastXmlUpdateTime = new Date();
									                    floor.render = webLocation + "/render.xml";                                
									                    floor.save(function(err, floor) {

									                        if (err){

									                            log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});						                            
									                        
									                        } else {

										                        res.send( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

									                        }		                          

									                        // Delete temped path.xml
									                        fs.unlink( tmpPathPath, function(err){} );

									                    });

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
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

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

// POST Interface for upload region.xml
exports.uploadRegion = function(req, res) {

	if(req.body._id && req.files.region){

	    Floor.findById(req.body._id, function(err, floor) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(floor){

	    			Building.findById( floor.buildingId, function( err, building ){

	    				if(err) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	    				} else {

	    					if( building ){

				    			// Check permisssion
				    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

				    				if(result){

								        // Get the temporary location of the file
								        var tmpPathPath = req.files.region.path;

								        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
								        var webLocation = building.userId + "/" + floor.buildingId + "/" + floor.layer,
								            folderPath = path.dirname() + "/" + config.mapInfoPath + '/' + webLocation;

								        // Make sure flolder exist    	        
							            mkdirp(folderPath, function(err, dd) {

							                if (err) {

							                    log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

							                } else {

								                var targetPathPath = folderPath + "/region.xml";
								                log.info("targetPathPath: " + targetPathPath);
								                	
								                fs.rename(tmpPathPath, targetPathPath, function(err) {

								                    if (err){

								                        log.error(err);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
														}); 

								                    } else {

									                    // Update floor
									                    floor.lastXmlUpdateTime = new Date();	
									                    floor.region = webLocation + "/region.xml";                                
									                    floor.save(function(err, floor) {

									                        if (err){

									                            log.error(err);
																res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																	msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																});						                            
									                        
									                        } else {

										                        res.send( errorResInfo.SUCCESS.code, floor );

											                    // Auto-package mapzip
											                    utilityS.packageMapzip(floor.buildingId, function(errorObj){});

										                        // Start to parse region
									                            fs.readFile(targetPathPath, 'utf8', function (err, data) {
									
									                                if(err)
									                                  log.error(err);
									
									                                if(data)
									                                	utilityS.parseRegion(data, floor._id)
									
									                            });

									                        }		                          

									                        // Delete temped path.xml
									                        fs.unlink( tmpPathPath, function(err){} );

									                    });

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
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								}); 

	    					}

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


// Function for parse applist.xml file
function parseApplist(applistXMLString, floorId){
	
	parseString(applistXMLString, function (err, result) {
		
		if(err){
			
			log.error(err);
			
		}else{
			
			try{
				
			    var aps = result.WiFiAPList && result.WiFiAPList.ap;
			    aps.forEach(function(ap){
			    	
			    	var tap = ap.$;
			    	
			    	// Create new ap
			    	Ap.findOne({
			    		
			    		apId: tap.id
			    		
			    	}, function(err, apo){
			    		
			    		if(err)
			    			log.error(err);
			    		
			    		if(apo){
			    						    			
			    			// Update ap
			    			apo.ssid = tap.ssid;
			    			apo.maxholdpwd = tap.maxholdpwd;
			    			apo.save(function(err, apObj){
			    				
			    				if(err)
			    					log.error(err);
			    				
			    				if(apObj)			    					
			    					updateRelationBetweenApAndFloor(apObj.apId, floorId);
			    				
			    			});
			    			
			    		}else{
			    			
			    			// Create new ap
					    	new Ap({
						    	
					    		apId: tap.id,			    		
					    		ssid: tap.ssid,			    		
					    		maxholdpwd: tap.maxholdpwd
					    		
					    	}).save(function(err, apObj){
					    		
					    		if(err)
					    			log.error(err);
					    			
					    		if(apObj)
					    			updateRelationBetweenApAndFloor(apObj.apId, floorId);
					    		
					    	});			    			
			    			
			    		}
			    					    		
			    	});
			    				    	
			    });				
				
			}catch(e){				
				
				log.error(e);
				
			}			
			
		}

	});	
	
}

// Function for update relation between app and floor
function updateRelationBetweenApAndFloor(apId, floorId){
	
	ApToFloor.findOne({
		
		apId: apId,
		floorId: floorId
		
	}, function(err, apToFloor){
		
		if(err)
			log.error(err);
		
		if(!apToFloor){
			
			// Create relation between building and ap
			new ApToFloor({
			
				apId: apId, // the attribute "apId" of ap(ap.appId not ap.id) 
				
				floorId: floorId			    							    				
				
			}).save(function(err, apToFloor){
			
				if(err)
					log.error(err.message);
				
			});							
			
		}
				
	});	
	
}