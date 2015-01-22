var log = require('log4js').getLogger("Poi routes"),
	crypto = require('crypto'),
	mkdirp = require("mkdirp"),
	utilityS = require("./utility"),
	User = require("../model/user"),
	Building = require("../model/building"),			
	Poi = require("../model/poi"),
	PoiEvent = require("../model/poiEvent"),	
	PoiTag = require("../model/poiTag"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo;

// GET Page for show poi event
exports.indexEvent = function(req, res){
	res.render("poi/poi-event-index.html");
}

// GET Interface for list poi event (list the specific month)
exports.listEvent = function(req, res){
	
	console.log(req.query);

	if(req.query.poiId && req.query.start && req.query.end) {

		// Caculate the query duration between start time and end time by params startDate 
		var start, end;
		try {
			start = new Date(req.query.start);
			end = new Date(req.query.end);
		} catch(e) {
			log.error("Poi list event error parse date");
			log.error(e);			
		}

		console.log(start);
		console.log(end);

		// Execute query
		PoiEvent.find({

			poiId: req.query.poiId,
			start: { $gte: start },
			end: { $lte: end }

		}, function(err, poiEvents) {

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				res.json(errorResInfo.SUCCESS.code, poiEvents);				

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

}

// POST Interface for create poi event
exports.createEvent = function(req, res){

	console.log(req.body);

	if(req.body.poiId && req.body.title && req.body.start && req.body.end ) {

		Poi.findById(req.body.poiId, function(err, poi){

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if(poi) {

					// Parse start time and end time
					var start, 
						end, 
						createdTime = new Date(); 
					try {
						start = new Date(req.body.start);
						end = new Date(req.body.end);
					} catch(e) {
						log.error("Poi event parse start or end time error")
						res.json( errorResInfo.INCORRECT_PARAMS.code , { 
							msg: "Poi event parse start or end time error"
						}); 			
					}	

					PoiEvent.create({

						title: req.body.title,
						desc: req.body.desc,
						poiId: req.body.poiId,
						start: start,
						end: end,			
						createdTime: createdTime,
						updatedTime: createdTime

					}, function(err, poiEvent){

						if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  		

						} else {

					    	res.json(errorResInfo.SUCCESS.code, poiEvent);				

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

}

// POST Interface for update poi event
exports.updateEvent = function(req, res){

	console.log(req.body);

	if(req.body._id && req.body.title && req.body.start && req.body.end ) {

		PoiEvent.findById(req.body._id, function(err, poiEvent){

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if(poiEvent) {

					// Parse start time and end time
					var start, 
						end, 
						updatedTime = new Date(); 
					try {
						start = new Date(req.body.start);
						end = new Date(req.body.end);
					} catch(e) {
						log.error("Poi event parse start or end time error")
						res.json( errorResInfo.INCORRECT_PARAMS.code , { 
							msg: "Poi event parse start or end time error"
						}); 			
					}	

					poiEvent.title = req.body.title;
					poiEvent.desc = req.body.desc;
					poiEvent.start = start;
					poiEvent.end = end;
					poiEvent.updatedTime = updatedTime;
					poiEvent.save(function(err, poiEvent){

						if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  		

						} else {

					    	res.json(errorResInfo.SUCCESS.code, poiEvent);				

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
	
}

// POST Interface for delete poi event
exports.deleteEvent = function(req, res){

	if(req.body._id){
				
		// Find building
		PoiEvent.findById(req.body._id, function(err, poiEvent){
			
			if(err) {

				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  


			} else {

				if(poiEvent){
					
                	utilityS.validatePermission(req.user, poiEvent, PoiEvent.modelName, function(result){

                		if(result) {
							
							poiEvent.remove(function(err){

								if(err) {

									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				        			});

								} else {

									// Response remove successfully
									res.json(errorResInfo.SUCCESS.code, {
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

}


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

    if(req.query.buildingId) {

    	Building.findById(req.query.buildingId, function(err, building){

    		if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

    		} else {

    			if(building) {

				 	// Pagination params
					var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;

					var queryJson = { buildingId: req.query.buildingId };
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
	if (req.body.name && req.body.buildingId) {

		Building.findById(req.body.buildingId, function(err, building){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				if(building) {

					// check permission
					utilityS.validatePermission(req.user, building, Building.modelName, function(result) {

						if(result) {

							var theDate = new Date();
							new Poi({

								name: req.body.name,
								tags: req.body.tags ? req.body.tags : [],
							    buildingId: req.body.buildingId,
							    createdTime: theDate,
							    updatedTime: theDate 			

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

		// Construct query json object (Search by name or custom fields key or value)
		var regex = new RegExp(req.query.q, "i");
		var queryJson = {
			userId: req.user._id,
			$or: [ { name: regex }, { customFields: { key:  regex } }, { customFields: { value:  regex } }  ]
		};

		// Setup pagination	(default page 1)
		var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;
		var skip = page * config.pageOffset;

		Poi.find(queryJson)
		.skip()
		.limit(config.pageOffset)
		.exec(function(err, pois){

			if(err) {

				log.error(err);
    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
    			});

			} else {

				Poi.count(queryJson, function(err, count){

					if(err) {

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

				});

			}

		});

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