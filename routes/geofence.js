var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	Geofence = require("../model/geofence"),
	GeofenceCoupon = require("../model/geofenceCoupon"),
	GeofencePolygonPoint = require("../model/geofencePolygonPoint"),
	Coupon = require("../model/coupon"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');


// GET Interface for list the geofence in specific floor
exports.list = function(req, res) {

	if (req.query.floorId) {

		Floor.findById( req.query.floorId, function(err, floor) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(floor) {

					// Check permission
		            utilityS.validatePermission( req.user, floor, Floor.modelName, function(result) {

		            	if(result) {

							Geofence.find( { 
							
								floorId: req.query.floorId
							
							}, function(err, gfs){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 							

								} else {
																										
									var gfsObj = [];
									for(var i=0; i<gfs.length; i++)
										gfsObj[i] = formatObjectDate(gfs[i]);			
									res.json( errorResInfo.SUCCESS.code, gfsObj);

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


// GET Interface for read specific iBeaconDevice
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Geofence.findById(req.params._id, function(err, gf) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				if(gf) {

					Floor.findById( gf.floorId, function(err, floor){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});	

						} else {

							utilityS.validatePermission(req.user, floor, Floor.modelName, function(result) {

					    		if(result){

									res.json( errorResInfo.SUCCESS.code, gf );

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

			}
			
		});			
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}
	
};


// POST Interface for create the new iBeaconDevice
exports.create = function(req, res) {

	if (req.body.floorId) {
							
		Floor.findById( req.body.floorId, function(err, floor){

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(floor) {

					// Check permisssion
	    			utilityS.validatePermission(req.user, floor, Floor.modelName, function(result){

	    				if(result) {

	    					// Create new geofence
							new Geofence({

								name: req.body.name,
							    floorId: req.body.floorId,									    
							    createdTime: new Date(),
							    updatedTime: new Date()

							}).save(function(err, gf) {

								if (err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});

								} else {

									if (gf) {

										if( req.body.points ) {

											// Create geofence polygon points if exist
											var points = req.body.points;
											var gfpps = [];
											for(var i=0; i<points.length; i++){

												(function(index) {

													new GeofencePolygonPoint({

														lat: points[index].lat,
														lon: points[index].lon,
														geofenceId: gf._id.toString()

													}, function(err, gfpp) {

														if(err) {

															log.error(err);

														} else {

															gfpps.push(gfpp);

														}

														if(index == points.length -1){

															var gfObj = formatObjectDate(gf);
															gfObj.points = gfpps;
															res.json(errorResInfo.SUCCESS.code, gfObj);

														}

													});

												}(i));

											}

										} else {

											var gfObj = formatObjectDate(gf);
											res.json(errorResInfo.SUCCESS.code, gfObj);

										}

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


// POST Interface for update iBeaconDevice
exports.update = function(req, res) {

	if (req.body._id && req.body.floorId) {

		Geofence.findById( req.body._id, function(error, gf) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( gf ) {

					Floor.findById( req.body.floorId, function(err, floor){

						if(err) {

							log.error(error);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

						} else {

							// Check permisssion
			    			utilityS.validatePermission(req.user, floor, Floor.modelName, function(result){

			    				if(result) {

			    					if(req.body.points && req.body.points.length) {

									    gf.name = req.body.name;
									    gf.floorId = req.body.floorId;
									    gf.updatedTime = new Date();
									    
			    						var points = req.body.points;

			    						// Remove all points first
			    						GeofencePolygonPoint.remove({

			    							geofenceId: req.body._id

			    						}, function(err, gfpps) {

			    							if(err) {

												log.error(error);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												}); 

			    							} else {

			    								// Create new points
			    								for(var i=0; i<points.length; i++) {

													(function(index) {

														new GeofencePolygonPoint({

															lat: points[index].lat,
															lon: points[index].lon,
															geofenceId: gf._id.toString()

														}, function(err, gfpp) {

															if(err) {

																log.error(err);

															} else {

																gfpps.push(gfpp);

															}

															if(index == points.length -1){

																gf.save(function(err, gf) {

																	if (err) {

																		log.error(err);
																		res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																			msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
																		});

																	} else {

																		if (gf) {

																			var gfObj = formatObjectDate(gf);
																			res.json(errorResInfo.SUCCESS.code, gfObj);

																		}

																	}

																});

															}

														});

													}(i));			    									

			    								}

			    							}	 

			    						});

			    					} else {

										gf.save(function(err, gf) {

											if (err) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												});

											} else {

												if (gf) {

													var gfObj = formatObjectDate(gf);
													res.json(errorResInfo.SUCCESS.code, gfObj);

												}

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

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

};

// POST Interface of delete specific iBeacon device
exports.del = function(req, res){
	
	if(req.body._id){
		
		Geofence.findById( req.body._id, function(err, gf) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(gf) {
					
	    			// Check permisssion
	    			utilityS.validatePermission(req.user, gf, Geofence.modelName, function(result) {

	    				if(result) {
							
	    					// Remove relations between coupon and geofence device first
	    					GeofenceCoupon.remove({

	    						geofenceId: req.body._id

	    					}, function(err) {

	    						if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

	    						} else {

									// Remove gf
									gf.remove(function(err){
										
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
	
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}	
		
};


// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	ibdObj.updatedTime = moment(ibd.updatedTime).format("YYYY/MM/DD HH:mm Z").toString();		
	return ibdObj;
	
}