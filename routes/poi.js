var log = require('log4js').getLogger(),
	mkdirp = require("mkdirp"),
	utilityS = require("./utility"),
	User = require("../model/user"),		
	Area = require("../model/area"),		
	Poi = require("../model/poi"),	
	PoiTag = require("../model/poiTag"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo;

// POST Interface for copy poi
exports.copy = function(req, res){
	if(req.body._id) {

		if(!req.session.copyPois)
			req.session.copyPois = [];

		var isDuplicate = false;
		for(var i=0; i<req.session.copyPois.length; i++) {
			if(req.session.copyPois[i]._id == req.body._id){
				isDuplicate = true;
				break;
			}
		}
		if(!isDuplicate)			
			req.session.copyPois.push(req.body);
		
		res.json(errorResInfo.SUCCESS.code, req.session.copyPois);
	
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	} 
}

// GET Interface for copy list of poi
exports.getCopies = function(req, res){
	if(!req.session.copyPois)
		req.session.copyPois = [];
	res.json(errorResInfo.SUCCESS.code, req.session.copyPois);
}

// POST Interface for copy poi template
exports.copyTemplate = function(req, res){
	if(req.body._id) {

		if(!req.session.copyTemplatePois)
			req.session.copyTemplatePois = [];

		var isDuplicate = false;
		for(var i=0; i<req.session.copyTemplatePois.length; i++) {
			if(req.session.copyTemplatePois[i]._id == req.body._id){
				isDuplicate = true;
				break;
			}
		}
		if(!isDuplicate)			
			req.session.copyTemplatePois.push(req.body);

		res.json(errorResInfo.SUCCESS.code, req.session.copyTemplatePois);
	
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	} 
}

// GET Interface for copy template list of poi
exports.getCopyTemplates = function(req, res){
	if(!req.session.copyTemplatePois)
		req.session.copyTemplatePois = [];
	res.json(errorResInfo.SUCCESS.code, req.session.copyTemplatePois);
}

// POST Interface for remove copy poi
exports.removeCopy = function(req, res){
	if(req.body.index || req.body.index == 0) {

		req.session.copyPois.splice(req.body.index, 1);
		res.json(errorResInfo.SUCCESS.code, req.session.copyPois);
	
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	} 
}

// POST Interface for remove copy poi template
exports.removeCopyTemplate = function(req, res){
	if(req.body.index || req.body.index == 0) {

		req.session.copyTemplatePois.splice(req.body.index, 1);
		res.json(errorResInfo.SUCCESS.code, req.session.copyTemplatePois);
	
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	} 
}


// GET Page for show specific poi
exports.show = function(req, res) {
	res.render("poi/poi-show.html");
};


// GET Interface for list pois of specific user
exports.list = function(req, res) {

    if(req.query.areaId) {

	 	// Pagination params
		var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;

		var queryJson = { areaId: req.query.areaId };
	    Poi.find(queryJson)
			.sort({ createdTime: -1 })
			.limit(config.pageOffset)
			.skip(page * config.pageOffset).exec( function(err, pois){

		        if(err){

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

					// Get area count
					Poi.count( queryJson, function(err, count) {

						if( err ) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  		

						} else {

					        res.json(errorResInfo.SUCCESS.code, {						        	
					        	page: page + 1,
					        	offset: config.pageOffset,
					        	count: count,
					        	pois: pois
							});    	

						}

					} );

				}

			});


    } else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});  

    }

};


// GET Interface for read specific poi
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Poi.findById(req.params._id, function(err, poi) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				// check permission
				utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {

					if(result) {

						res.json(errorResInfo.SUCCESS.code, poi);

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

	console.log(req.body);
	if (req.body.name && req.body.areaId) {

		Area.findById(req.body.areaId, function(err, area){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				if(area) {

					// check permission
					utilityS.validatePermission(req.user, area, Area.modelName, function(result) {

						if(result) {

							new Poi({

								name: req.body.name,
								tags: req.body.tags ? req.body.tags : [],
							    areaId: req.body.areaId,
							    userId: req.user._id,
							    createdTime: new Date(),
							    updatedTime: new Date() 			

							}).save(function(err, poi){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});	

								} else {

									res.json( errorResInfo.SUCCESS.code , poi);	

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


// POST Interface for update poi
exports.update = function(req, res) {

	if (req.body._id) {

		Poi.findById( req.body._id, function(error, poi) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if(poi) {

					// check permission
					utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {
					    
						if(result) {

						    poi.name = req.body.name;
						    poi.buildingId = req.body.buildingId;
						    console.log(req.body.tags);
						    poi.tags = req.body.tags;
						    console.log(poi.tags);
						    
						    poi.customFields = req.body.customFields;
						    poi.markModified('customFields');
						    poi.updatedTime = new Date();
							poi.save(function(err, poi) {

								if (err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});

								} else {

									if (poi) {

										var couponObj = formatObjectDate(poi);
										res.json(errorResInfo.SUCCESS.code, poi);

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


// POST Interface of delete specific poi 
exports.del = function(req, res){
	
	if(req.body._id){
		
		Poi.findById( req.body._id, function(err, poi) {

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(poi) {
					
					// check permission
					utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {
	    						
	    				console.log(result);		
						if(result) {

	    					// Remove poi
	    					poi.remove(function(err) {

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


// POST Interface for upload file
exports.uploadFile = function(req, res) {

	if(req.body._id && req.body.type && req.files.file) {

		// Get file name and extension
		var fileName = req.files.file.name;
		var extension = path.extname(fileName).toLowerCase();
		var tmpPath = req.files.file.path;
		log.info("tmpPath: " + tmpPath);

		// Check file format by extension
		if(req.body.type == "image") {

			extension = extension === '.png' ? ".png" : null ||
						extension === '.jpg' ? ".jpg" : null ||
						extension === '.gif' ? ".gif" : null;

		} else if(req.body.type == "audio") {

			extension = extension === '.mp3' ? ".mp3" : null ||
						extension === '.ogg' ? ".ogg" : null;

		} else {}

		if(extension) {

			// Read file and prepare hash
			var md5sum = crypto.createHash('md5'),
				stream = fs.ReadStream(tmpPath);

			stream.on('data', function(d) {
				md5sum.update(d);
			});

			stream.on('end', function() {

				Poi.findById(req.body._id, function(error, poi){

					if(error) {

		                log.error(err);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						});

					} else {

						if( poi ) {

			    			// Check permisssion
			    			utilityS.validatePermission(req.user, poi, Poi.modelName, function(result){

			    				if(result) {

									// Set target file name by hash the file mapInfoResourcePath
									var targetFileName = md5sum.digest('hex')  + extension,
										folderPath =  config.mapInfoPath + "/" + poi.userId + "/" + config.mapInfoResourcePath,
										targetPath =  folderPath + "/" + targetFileName,
										targetWebPath = poi.userId + "/" + config.mapInfoResourcePath + "/" + targetFileName;
									
									log.info("targetPath: " + targetPath);

									// Check folder exist
									mkdirp(folderPath, function(err) {

										if(err) {

											log.error(err);

										} else {

											log.info("targetName: " + targetFileName);
											log.info("targetWebPath: " + targetWebPath);
											fs.rename(tmpPath, targetPath, function(err) {
												if(err){

													log.error(err);
									    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									    			});  

												}else{

													res.send( errorResInfo.SUCCESS.code, targetWebPath );

													// Delete the temporary file
						                            fs.unlink(tmpPath, function(err){
						                            	log.error(err);
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

		        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
		        				msg: errorResInfo.INCORRECT_PARAMS.msg
		        			});  						

						}//end if

					}

				});

			});

		} else {

			res.json( errorResInfo.INCORRECT_FILE_TYPE.code , { 
				msg: errorResInfo.INCORRECT_FILE_TYPE.msg
			});

		}

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});	

	}

}

// Get interface for get file
exports.getFile = function(req, res) {

    if(req.query.filePath && req.query.type){

        try{
        	
            var fileName = req.query.filePath,
            	filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName,
            	stat = fs.statSync(filePath),
            	type = req.query.type,
            	contentType;


            if(type == "image") {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-type": "image/png",
	                'Content-Length': stat.size
	            });

            } else if(type == "audio") {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-type": "audio/mpeg",
	                'Content-Length': stat.size
	            });

            } else {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-type": "application/octet-stream",
	                "Content-disposition": "attachment; filename=map.zip",
	                "Content-Length": stat.size
	            });

            }            	           

		    var readStream = fs.createReadStream(filePath);

		    // We replaced all the event handlers with a simple call to util.pump()
		    readStream.pipe(res);


        }catch(e){

            log.error(e);
            res.json(400, {
            	msg: "file doesn't exist"
            });            

        }
        
    } else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});	

    }

}


// Get interface for search specific poi of area
exports.search = function(req, res) {
	console.log(req.query);
	if(req.query.q) {


	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});	


	}

}


// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	ibdObj.updatedTime = moment(ibd.updatedTime).format("YYYY/MM/DD HH:mm Z").toString();		
	return ibdObj;
	
}