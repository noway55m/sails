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
	config = require('../config/config'),
	i18n = require("i18n");

// Static variable
var	errorResInfo = utilityS.errorResInfo;

// GET Page for show poi event
exports.indexEvent = function(req, res){
	res.render("poi/poi-event-index.html");
}

// GET Interface for list poi event (list the specific month)
exports.listEvent = function(req, res){
	
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
					msg: i18n.__('error.500Error')
				}); 

			} else {

				res.json(errorResInfo.SUCCESS.code, poiEvents);				

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
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
					msg: i18n.__('error.500Error')
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
								msg: i18n.__('error.500Error')
							});  		

						} else {

					    	res.json(errorResInfo.SUCCESS.code, poiEvent);				

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

}

// POST Interface for update poi event
exports.updateEvent = function(req, res){

	console.log(req.body);

	if(req.body._id && req.body.title && req.body.start && req.body.end ) {

		PoiEvent.findById(req.body._id, function(err, poiEvent){

			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
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
								msg: i18n.__('error.500Error')
							});  		

						} else {

					    	res.json(errorResInfo.SUCCESS.code, poiEvent);				

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
	
}

// POST Interface for delete poi event
exports.deleteEvent = function(req, res){

	if(req.body._id){
				
		// Find building
		PoiEvent.findById(req.body._id, function(err, poiEvent){
			
			if(err) {

				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});  


			} else {

				if(poiEvent){
					
                	utilityS.validatePermission(req.user, poiEvent, PoiEvent.modelName, function(result){

                		if(result) {
							
							poiEvent.remove(function(err){

								if(err) {

									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				        				msg: i18n.__('error.500Error')
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
			msg: i18n.__('error.400IncorrectParams')
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
			msg: i18n.__('error.400IncorrectParams')
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
			msg: i18n.__('error.400IncorrectParams')
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
			msg: i18n.__('error.400IncorrectParams')
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
					msg: i18n.__('error.500Error')
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
								msg: i18n.__('error.500Error')
							});  		

						} else {

							// Get area count
							Poi.count( queryJson, function(err, count) {

								if( err ) {

						            log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
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


// GET Interface for read specific poi
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Poi.findById(req.params._id, function(err, poi) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				// check permission
				utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {

					if(result) {

						res.json(errorResInfo.SUCCESS.code, poi);

					} else {

	        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
	        				msg: i18n.__('error.403PermissionDeny')
	        			});

					}

				}, true);

			}
			
		});			
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
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
					msg: i18n.__('error.500Error')
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
										msg: i18n.__('error.500Error')
									});	

								} else {

									res.json( errorResInfo.SUCCESS.code , poi);	

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


// POST Interface for update poi
exports.update = function(req, res) {

	if (req.body._id) {

		Poi.findById( req.body._id, function(error, poi) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 				

			} else {

				if(poi) {

					// check permission
					utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {
					    
						if(result) {

						    poi.name = req.body.name;
						    poi.buildingId = req.body.buildingId;
						    poi.tags = req.body.tags;						    
						    poi.customFields = req.body.customFields;
						    poi.markModified('customFields');
						    poi.updatedTime = new Date();
							poi.save(function(err, poi) {

								if (err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
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

// POST Interface of delete specific poi 
exports.del = function(req, res){
	
	if(req.body._id){
		
		Poi.findById( req.body._id, function(err, poi) {

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 

			} else {

				if(poi) {
					
					// check permission
					utilityS.validatePermission(req.user, poi, Poi.modelName, function(result) {
	    						
						if(result) {

	    					// Remove poi
	    					poi.remove(function(err) {

	    						if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									}); 

	    						} else {

									res.json( errorResInfo.SUCCESS.code, {
										_id: req.body._id
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

// POST Interface for upload file
exports.uploadFile = function(req, res) {

	if(req.body._id && req.body.type && req.body.fieldId && req.files.file) {

		// Get relative params
		var poiId = req.body._id;
		var type = req.body.type;
		var fieldId = req.body.fieldId;		
		var file = req.files.file;
		var fileName = file.name;
		var extension = path.extname(fileName).toLowerCase();
		var fileSize = file.size;
		var tmpPath = file.path;

		log.info("poiId: " + poiId);
		log.info("type: " + type);		
		log.info("fieldId: " + fieldId);
		log.info("file name: " + fileName);
		log.info("file extension: " + extension);
		log.info("file size: " + fileSize);		
		log.info("tmpPath: " + tmpPath);

		// Check file format by extension(mimeType)
		extension = checkExtensionOfUploadFile(type, extension);		

		// Check file size is over maximum or not
		if(fileSize <= config.maximumUploadSize) {

			if(extension) {

				// Read file and prepare hash
				var md5sum = crypto.createHash('md5'),
					stream = fs.ReadStream(tmpPath);

				stream.on('data', function(d) {
					md5sum.update(d);
				});

				stream.on('end', function() {

					Poi.findById(poiId, function(error, poi){

						if(error) {

			                log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});

						} else {

							if( poi ) {

								Building.findById(poi.buildingId, function(err, building){

									if(err) {

						                log.error(err);
										res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
											msg: i18n.__('error.500Error')
										});

									} else {

										if(building) {

							    			// Check permisssion
							    			utilityS.validatePermission(req.user, building, Building.modelName, function(result){

							    				if(result) {

													// Set target file name by hash the file mapInfoResourcePath
													var targetFileName = md5sum.digest('hex')  + extension,
														folderPath =  config.mapInfoPath + "/" + building.userId + "/" + config.mapInfoResourcePath,
														targetPath =  folderPath + "/" + targetFileName,
														targetWebPath = building.userId + "/" + config.mapInfoResourcePath + "/" + targetFileName;
													
													log.info("targetPath: " + targetPath);

													// Check folder exist
													mkdirp(folderPath, function(err) {

														if(err) {

															log.error(err);
															res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																msg: i18n.__('error.500Error')
															});														

														} else {

															log.info("targetName: " + targetFileName);
															log.info("targetWebPath: " + targetWebPath);

															// Find the specific field in custom fields
															var theField = null;
															for(var i=0; i<poi.customFields.length; i++) {
																if(poi.customFields[i]._id.toString() == fieldId)
																	theField = poi.customFields[i];	
															}

															// Check the upload file is the same as before or not
															if(theField.value.indexOf(targetFileName) == -1) {

																fs.rename(tmpPath, targetPath, function(err) {
																	if(err) {

																		log.error(err);
														    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														    				msg: i18n.__('error.500Error')
														    			});  

																	} else {

																		res.send( errorResInfo.SUCCESS.code, targetWebPath );
																		poi.save(function(err, poi){
																			if(err) {
																            
																                log.error(err);
																				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																					msg: i18n.__('error.500Error')
																				});
																			
																			} else {

																				res.send( errorResInfo.SUCCESS.code, targetWebPath );
																			
																			}
																		});

																		// Delete the temporary file
																		fs.exists(tmpPath, function(exists){
																			console.log("is temp file exists: " + exists);
																			if(exists){
													                            fs.unlink(tmpPath, function(err){
													                            	if(err)
													                            		log.error(err);
													                            	else
													                            		console.log("Remove temp file successfully");
													                            });										
																			}
																		});
																		
																	}
																});		

															} else {

																log.info("Same");
																res.send( errorResInfo.SUCCESS.code, targetWebPath );																

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

							                log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: i18n.__('error.500Error')
											});

										}

									}

								});

							} else {

			        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			        				msg: i18n.__('error.400IncorrectParams')
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

			res.json( errorResInfo.OVER_UPLOAD_MAXIMUM_SIZE.code , { 
				msg: errorResInfo.OVER_UPLOAD_MAXIMUM_SIZE.msg
			});

		}

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		});	

	}

}

// Get interface for get file
exports.getFile = function(req, res) {

    if(req.query.filePath && req.query.type){

        try{
        	
            var fileName = req.query.filePath,
            	filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName,
            	extension = path.extname(filePath).toLowerCase(),
            	stat = fs.statSync(filePath),
            	total = stat.size,
            	type = req.query.type,
            	readStream = fs.createReadStream(filePath);

            if(type == Poi.CUSTOM_FIELDS.TYPE.IMAGE) {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-Type": "image/" + extension.replace(".",""),
	                'Content-Length': total
	            });
		    	readStream.pipe(res);

            } else if(type == Poi.CUSTOM_FIELDS.TYPE.AUDIO) {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-Type": "audio/mpeg",
	                'Content-Length': total
	            });
		    	readStream.pipe(res);

            } else if(type == Poi.CUSTOM_FIELDS.TYPE.VIDEO) {

				// Check 'range' header for handle the partial download 	
				if (req.headers['range']) {
					
					// Parse the start, end and chunk size
					var range = req.headers.range;
					var parts = range.replace(/bytes=/, "").split("-");
					var partialstart = parts[0];
					var partialend = parts[1];

					// Transfer to integer
					var start = parseInt(partialstart, 10);
					var end = partialend ? parseInt(partialend, 10) : total-1;
					var chunksize = (end-start)+1;
					log.info('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

					var readStream = fs.createReadStream(filePath, {start: start, end: end});
					res.writeHead( errorResInfo.PARTIAL_DOWNLOAD_SUCCESS.code, { 
						'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 
						'Accept-Ranges': 'bytes', 
						'Content-Length': chunksize, 
						'Content-Type': 'video/mp4' 
					});

				} else {

					log.info('Custom fields of video streaming  of POI - all: ' + total);
					res.writeHead( errorResInfo.SUCCESS.code, { 
						'Content-Length': total, 
						'Content-Type': 'video/mp4' 
					});

				}

				readStream.pipe(res);

            } else if(type == Poi.CUSTOM_FIELDS.TYPE.FILE) {

	            res.writeHead( errorResInfo.SUCCESS.code, {
	                "Content-Type": "application/octet-stream",
	                "Content-Disposition": "attachment; filename=file",
	                "Content-Length": stat.size
	            });

            } else {

            	throw new Error("Type not support");

            }           	           

        } catch(e) {

        	log.error("Get video, audio or file of custom fields error");
            log.error(e);
            res.json( errorResInfo.FILE_NOT_EXIST.code, {
            	msg: errorResInfo.FILE_NOT_EXIST.msg
            });            

        }
        
		// This catches any errors that happen while creating the readable stream (usually invalid names)
		readStream.on('error', function(err) {
			console.log(err);
			res.end(err);
		});

    } else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
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
    				msg: i18n.__('error.500Error')
    			});

			} else {

				Poi.count(queryJson, function(err, count){

					if(err) {

						log.error(err);
		    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
		    				msg: i18n.__('error.500Error')
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
			msg: i18n.__('error.400IncorrectParams')
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

// Function for check the upload file extension, retrun the extension if exist, else return null
function checkExtensionOfUploadFile(type, extension){

	var ext = null;
	if(type == Poi.CUSTOM_FIELDS.TYPE.IMAGE) {

		ext = extension === '.png' ? ".png" : null ||
					extension === '.jpg' ? ".jpg" : null ||
					extension === '.gif' ? ".gif" : null;

	} else if(type == Poi.CUSTOM_FIELDS.TYPE.VIDEO){

		ext = extension === '.mp4' ? ".mp4" : null;

	} else if(type == Poi.CUSTOM_FIELDS.TYPE.AUDIO) {

		ext = extension === '.mp3' ? ".mp3" : null ||
					extension === '.ogg' ? ".ogg" : null;

	} else if (type == Poi.CUSTOM_FIELDS.TYPE.FILE) {

		ext = extension ? extension : null;

	}

	return ext;

}