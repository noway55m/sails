var log = require('log4js').getLogger(),
	utilityS = require("./utility.js"),
	Floor = require("../model/floor"), 
	Store = require("../model/store"),
	Ad = require("../model/ad"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config'),
	i18n = require("i18n");

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	image_path = config.imagePath;

// Page for show the store in the floor of specific building
exports.show = function(req, res) {	
	res.render("store/store-show.html");
};

// GET¡@Interface for read the store in the floor of specific building
exports.read = function(req, res) {
	
	if( req.params._id ){

		Store.findById(req.params._id, function( error, store ) {
			
			if( error ) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});  				

			} else {

				if( store ) {

		            // Check permission
		            utilityS.validatePermission( req.user, store, Store.modelName, function(result) {

		            	if(result) {

		            		res.send( errorResInfo.SUCCESS.code, store);

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: i18n.__('error.403PermissionDeny')
		        			});

		            	}

		            }, true);
				
				} else {

        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: i18n.__('error.400IncorrectParams')
        			});  

				}
					
			}
						
		});

	}

};

// Interface for list the stores in specific floor of specific building
exports.list = function(req, res) {
	
	if (req.query.floorId) {

		Floor.findById(req.query.floorId, function(err, floor){

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});					
			
			} else {

				if(floor) {

		            // Check permissionco
		            utilityS.validatePermission( req.user, floor, Floor.modelName, function(result) {

		            	if(result) {

							Store.find({
								
								floorId : req.query.floorId
							
							}, function(err, stores) {
								
								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									});	

								} else {

									res.json( errorResInfo.SUCCESS.code, stores );

								}
								
							});

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: i18n.__('error.403PermissionDeny')
		        			});

		            	}

		            }, true);

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


// POST Interface for create the new store in specific floor of specific building
exports.create = function(req, res){
	
	if(req.body.name && req.body.floorId) {
		
		Floor.findById(req.body.floorId, function(err, floor){

			if (err){

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});					
			
			} else {

				if(floor) {

		            // Check permission
		            utilityS.validatePermission( req.user, floor, Floor.modelName, function(result) {

		            	if(result) {

							// Use find rather than fineOne for check duplicate stores
							Store.find({
								
								name: req.body.name,
								floorId: req.body.floorId
								
							}, function( err, stores ){
								
								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									});				

								} else {

									if( stores.length > 0 ){
										
										res.json( errorResInfo.SUCCESS.code, {
											msg: "Store name is duplicate!"
										});
										
									}else{
										
										new Store({

										    name: req.body.name,
										    link: req.body.link,			    
										    phone: req.body.phone,			    
										    memo: req.body.memo,			    		    
										    floorId: req.body.floorId

										}).save(function(error, store){

											if( err ) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: i18n.__('error.500Error')
												});	

											} else {

												res.json( errorResInfo.SUCCESS.code, store );

											}

										});	
										
									}

								}
								
							});

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: i18n.__('error.403PermissionDeny')
		        			});

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

// POST Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	if(req.body._id && req.body.name){
		
		Store.findById(req.body._id, function(err, store) {
			
			if (err){

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});					
			
			} else {

				if( store ) {
					
		            // Check permission
		            utilityS.validatePermission( req.user, store, Store.modelName, function(result) {

		            	if(result) {

							Store.find({
								
								name: req.body.name,
								floorId: store.floorId
								
							}, function( err, stores ){
								
								if(err){

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									});								
								
								} else {

									if( stores.length > 0 && stores[0]._id == store._id ) {
										
										res.json( errorResInfo.SUCCESS.code, {
											msg: "Store name is duplicate!"
										});
										
									}else{
										
										store.name = req.body.name;
										store.phone = req.body.phone;				
										store.link = req.body.link;
										store.memo = req.body.memo;
										// store.floorId = req.body.floorId; not support now			
										store.save( function( err, store ) {

											if(err) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: i18n.__('error.500Error')
												});	

											} else {

												res.send( errorResInfo.SUCCESS.code, store );

											}
											
										});						
										
									}

								}
								
							});

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: i18n.__('error.403PermissionDeny')
		        			});

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


// POST Interface for delete the store and relative ads
exports.del = function(req, res){
	
	if(req.body._id){
		
		Store.findById(req.body._id, function(err, store){
			
			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				if(store){
					
		            // Check permission
		            utilityS.validatePermission( req.user, store, Store.modelName, function(result) {

		            	if(result) {

							var storeId = req.body._id;
							
							// Delete store image if exist
							if(store.icon){
								var oldImgPath = path.resolve(image_path + "/" + store.icon);
								fs.unlink(oldImgPath, function(err){
									log.error(err);
								});	
							}
							
							// Remove store
							store.remove(function(err){
								
								if(err){

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									});				

								}else{

									res.json( errorResInfo.SUCCESS.code, {
										_id: req.body._id
									});

								}
								
							});
							
							// Find all relative ads
							Ad.find({
								
								storeId: storeId
							
							}, function(err, ads){
								
								if(err)						
									log.error(err);
								
								for(var i=0; i<ads.length; i++){
									
									// Delete ad image
									if(ads[i].image){
										var oldAdImgPath = path.resolve(image_path + "/" + ads[i].image);
										console.log(oldAdImgPath);
										fs.unlink(oldAdImgPath, function(err){
											log.error(err);
										});														
									}
									
									// Remove ad
									ads[i].remove(function(err){
										log.error(err);
									});
									
								}					
								
							});	

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: i18n.__('error.403PermissionDeny')
		        			});

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
				
				Store.findById(req.body._id, function(error, store){
					
					if(error) {

		                log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: i18n.__('error.500Error')
						});

					} else {

						if(store) {
							
			    			// Check permisssion
			    			utilityS.validatePermission(req.user, store, Store.modelName, function(result){

			    				if(result) {

									log.info("icon: " + store.icon);
									log.info("targetName: " + targetFileName);						
									if(store.icon != targetFileName){
										
										log.info("Update");
										fs.rename(tmpPath, targetPath, function(err) {

											if(err){

												log.error(err);
								    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								    				msg: i18n.__('error.500Error')
								    			});  
																					
											}else{									
												
												// Delete old image if exist
												if(store.icon){
													var oldImgPath = path.resolve(image_path + "/" + store.icon);
													fs.unlink(oldImgPath, function(err){
														log.error(err);
													});
												}
												
												// Update store
												store.icon = targetFileName;
												store.save( function( err ) {

													if( err ) {

										    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										    				msg: i18n.__('error.500Error')
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
										res.json( errorResInfo.SUCCESS.code, targetFileName );

									}	

			    				} else {

		                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		                				msg: i18n.__('error.403PermissionDeny')
		                			});	

			    				}

			    			});												
							
						}else{
							
		        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
		        				msg: i18n.__('error.400IncorrectParams')
		        			}); 
							
						}//end if

					}					
					
				});
				
			});			
			
		}else{
			
			res.send( errorResInfo.INCORRECT_FILE_TYPE.code, { 
				msg: "File extension should be .png or .jpg or gif" 
			});

		}		
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		});			

	}	
	
};