var log = require('log4js').getLogger(), 
	utilityS = require("./utility"),
	Store = require("../model/store"),	
	Ad = require("../model/ad"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	image_path = config.imagePath;

// GET Page for show specific ad
exports.show = function(req, res) {
	res.render("ad/ad-show.html");
};

// GET Interface for list the ads of store
exports.list = function(req, res) {

	if (req.query.storeId) {

		Store.findById( req.query.storeId, function(err, store) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(store) {

		            // Check permission
		            utilityS.validatePermission( req.user, store, Store.modelName, function(result) {

		            	if(result) {

							Ad.find({
								
								storeId : req.query.storeId
							
							}, function(err, ads) {
								
						        if (err){

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});  				

						        } else {

									var adsObj = [];
									for(var i=0; i<ads.length; i++)
										adsObj[i] = formatObjectDate(ads[i]);			
									res.json( errorResInfo.SUCCESS.code, adsObj);

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

// GET Interface for read specific ad of ad
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Ad.findById(req.params._id, function(err, ad) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				if(ad) {

					utilityS.validatePermission(req.user, ad, Ad.modelName, function(result) {

			    		if(result){

							var adObj = formatObjectDate(ad);
							res.json( errorResInfo.SUCCESS.code, adObj );

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

// POST Interface for create the new ad of ad
exports.create = function(req, res) {

	if (req.body.storeId && req.body.name && req.body.price && req.body.desc) {


		Store.findById( req.body.storeId, function(error, store) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( store ) {

					// Check permisssion
	    			utilityS.validatePermission(req.user, store, Store.modelName, function(result){

	    				if(result) {

	    					// Create new ad
							new Ad({

								name : req.body.name,
								price : req.body.price,
								desc : req.body.desc,
								startTime : new Date(),
								endTime : new Date(),
								storeId : req.body.storeId

							}).save(function(err, ad) {

								if (err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});

								} else {

									if (ad) {

										var adObj = formatObjectDate(ad);
										res.json(errorResInfo.SUCCESS.code, adObj);

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

// POST Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	if(req.body._id && req.body.storeId && req.body.name && req.body.price && req.body.desc){
		
		Ad.findById(req.body._id, function(err, ad) {
			
			if (err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 	

			} else {

				if (ad) {				
					
	    			// Check permisssion
	    			utilityS.validatePermission(req.user, ad, Ad.modelName, function(result) {

	    				if(result) {

							ad.name = req.body.name;
							ad.price = req.body.price;				
							ad.desc = req.body.desc;
							ad.startTime = new Date(req.body.startTime);
							ad.endTime = new Date(req.body.endTime);
							// ad.storeId = req.body.storeId;				
							ad.save(function(err, ad){
								
								if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

								} else {

									var adObj = formatObjectDate(ad);			
									res.json( errorResInfo.SUCCESS.code, adObj);

								}
								
							});

	    				} else {

                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
                			});

	    				}	    					

	    			})

				} else {

        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			}); 

				}				

			}

		});

	}

};		

// POST Interface of delete specific ad
exports.del = function(req, res){
	
	if(req.body._id){
		
		Ad.findById( req.body._id, function(err, ad) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(ad) {
					
	    			// Check permisssion
	    			utilityS.validatePermission(req.user, ad, Ad.modelName, function(result) {

	    				if(result) {

							// Delete ad image if exist
							if(ad.image){
								var oldImgPath = path.resolve(image_path + "/" + ad.image);
								fs.unlink(oldImgPath, function(err){
									log.error(err);
								});				
							}
							
							// Remove ad
							ad.remove(function(err){
								
								if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

								} else {

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

	    			})
					
				} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
					}); 

				}

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
				var targetPath = path.resolve(image_path + "/" + targetFileName);
				log.info("targetPath: " + targetPath);
				
				Ad.findById(req.body._id, function(error, ad){
					
					if(error) {

		                log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						});

					} else {

						if(ad){
							
			    			// Check permisssion
			    			utilityS.validatePermission(req.user, ad, Ad.modelName, function(result){

			    				if(result) {

									log.info("image: " + ad.image);
									log.info("targetName: " + targetFileName);						
									if(ad.image != targetFileName) {
										
										log.info("Update");
										fs.rename(tmpPath, targetPath, function(err) {

											if(err){

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												});

											}else{									

												// Delete old image	if exist
												if(ad.image){
													var oldImgPath = path.resolve(image_path + "/" + ad.image);
													fs.unlink(oldImgPath, function(err){
														log.error(err);
													});
												}
												
												// Update ad
												ad.image = targetFileName;
												ad.save(function(err, ad) {

													if(err) {

														log.error(err);
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
										
									} else {
										
										log.info("Same file, no need to update image");
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
			
		} else {
			
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

// Function for clone object and format time
function formatObjectDate(ad){

	var adObj = JSON.parse(JSON.stringify(ad));
	adObj.startTime = moment(ad.startTime).format("MM/DD/YYYY").toString();
	adObj.endTime = moment(ad.endTime).format("MM/DD/YYYY").toString();		
	return adObj;
	
}