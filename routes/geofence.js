var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	Floor = require("../model/floor"),	
	Geofence = require("../model/geofence"),
	GeofenceCoupon = require("../model/geofenceCoupon"),
	GeofencePolygonPoint = require("../model/geofencePolygonPoint"),
	Coupon = require("../model/coupon"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config'),
	i18n = require("i18n");

// Static variable
var	errorResInfo = utilityS.errorResInfo;


// GET Interface for list the geofence in specific floor
exports.list = function(req, res) {

	if (req.query.floorId) {

		Floor.findById( req.query.floorId, function(err, floor) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
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
										msg: i18n.__('error.500Error')
									}); 							

								} else {
										
					                var gfids = [];
					                for(index in gfs){
				                        var gf = gfs[index];
				                        gfids.push(gf._id.toString());
					                }


									GeofencePolygonPoint.find({

										geofenceId: { $in: gfids }

									}, function(err, gfpps){

										if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: i18n.__('error.500Error')
											}); 

										} else {

							                // Find all coupons
							                GeofenceCoupon.find({

							                    geofenceId: { $in: gfids }

							                }, function(err, gfcs){ 

							                	if(err) {

													log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: i18n.__('error.500Error')
													}); 

							                	} else {

									                var cids = [];
									                for(index in gfcs){
								                        var gfc = gfcs[index];
								                        cids.push(gfc.couponId);
									                }

							                		Coupon.find({

							                			_id: { $in: cids }

							                		}, function(err, coupons){

							                			if(err) {

															log.error(err);
															res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																msg: i18n.__('error.500Error')
															});

							                			} else {

							                				var gfsObj = [];
							                				for(var m=0; m<gfs.length; m++) {

							                					gfsObj[m] = formatObjectDate(gfs[m]);	
							                					var theCoupons = [];
							                					var thePoints = [];

								                				for(var k=0; k<gfcs.length; k++) {

								                					if(gfs[m]._id.toString() == gfcs[k].geofenceId){
								                						for(var l=0; l<coupons.length; l++) {
								                							if(gfcs[k].couponId == coupons[l]._id.toString()){
								                								theCoupons.push(coupons[l]);
								                								break;
								                							}
								                						}
								                					}						                					

								                				}

						                						for(var e=0; e<gfpps.length; e++) {
						                							if(gfs[m]._id.toString() == gfpps[e].geofenceId.toString()){
						                								thePoints.push(gfpps[e]);
						                							}
						                						}
						                						
								                				gfsObj[m].points = thePoints;
								                				gfsObj[m].coupons = theCoupons;

								                			}
								                			
								                			res.json( errorResInfo.SUCCESS.code, gfsObj);

							                			}

							                		});					                		

							                	}

							                });

										}

									});

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


// GET Interface for read specific geofence
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Geofence.findById(req.params._id, function(err, gf) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				if(gf) {

					Floor.findById( gf.floorId, function(err, floor){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});	

						} else {

							utilityS.validatePermission(req.user, floor, Floor.modelName, function(result) {

					    		if(result){

					    			GeofencePolygonPoint.find({

					    				geofenceId: gf._id.toString()
					    			
					    			}, function(err, gfpps){

					    				if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: i18n.__('error.500Error')
											});	

					    				} else {


					    					GeofenceCoupon.find({

					    						geofenceId: gf._id.toString()

					    					}, function(err, gfcs){

					    						if(err) {

													log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: i18n.__('error.500Error')
													});	

					    						} else {

					    							var ids = [];
					    							for(var n=0; n<gfcs.length; n++)
					    								ids.push(gfcs[n].couponId);

					    							Coupon.find({

					    								_id: { $in: ids }

					    							}, function(err, cps) {

					    								if(err) {

															log.error(err);
															res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
																msg: i18n.__('error.500Error')
															});	

					    								} else {

									    					var gfObj = JSON.parse(JSON.stringify(gf));
									    					gfObj.points = gfpps;
									    					gfObj.coupons = cps;
									    					res.json( errorResInfo.SUCCESS.code, gfObj );

					    								}

					    							});

					    						}

					    					});

					    				}

					    			});
								
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

			}
			
		});			
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}
	
};


// POST Interface for create the new geofence
exports.create = function(req, res) {

	if (req.body.floorId) {
							
		Floor.findById( req.body.floorId, function(err, floor){

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
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
										msg: i18n.__('error.500Error')
									});

								} else {

									if (gf) {

										if( req.body.points ) {
					
											var points;
											try{

												points = JSON.parse(req.body.points);
												
											} catch(e) {

												log.error(e);
												res.json( errorResInfo.INCORRECT_PARAMS.code , { 
													msg: "Incorrect format of points parameter!"
												}); 

											}

											// Create geofence polygon points if exist
											var gfpps = [];
											for(var i=0; i<points.length; i++){

												(function(index) {

													var point = points[index];

													new GeofencePolygonPoint({

														lat: point.lat,
														lon: point.lon,
														geofenceId: gf._id.toString()

													}).save(function(err, gfpp) {

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


// POST Interface for update geofence
exports.update = function(req, res) {

	if (req.body._id) {

		Geofence.findById( req.body._id, function(error, gf) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 				

			} else {

				if( gf ) {

					Floor.findById( req.body.floorId, function(err, floor){

						if(err) {

							log.error(error);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							}); 

						} else {

							// Check permisssion
			    			utilityS.validatePermission(req.user, floor, Floor.modelName, function(result){

			    				if(result) {

								    gf.name = req.body.name;
								    
								    if(req.body.floorId)
								    	gf.floorId = req.body.floorId;
								    
								    gf.updatedTime = new Date();


			    					if(req.body.points) {
									    
										// Remove points first before create new one
										GeofencePolygonPoint.remove({

											geofenceId: gf.id.toString()

										}, function(err) {

											if(err) {
			
												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: i18n.__('error.500Error')
												});

											} else {

												var points;
												try{

													points = JSON.parse(req.body.points);
													
												} catch(e) {

													log.error(e);
													res.json( errorResInfo.INCORRECT_PARAMS.code , { 
														msg: "Incorrect format of points parameter!"
													}); 

												}

												// Create geofence polygon points if exist
												var gfpps = [];
												for(var i=0; i<points.length; i++){

													(function(index) {

														var point = points[index];

														new GeofencePolygonPoint({

															lat: point.lat,
															lon: point.lon,
															geofenceId: gf._id.toString()

														}).save(function(err, gfpp) {

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

											}

										});


			    					} else {

										gf.save(function(err, gf) {

											if (err) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: i18n.__('error.500Error')
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
		                				msg: i18n.__('error.403PermissionDeny')
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


// POST Interface for create or update relation between geofence and Coupon
exports.bindCoupons = function(req, res) {

	if(req.body._id && req.body.coupons) {

		Geofence.findById( req.body._id, function(err, gf) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 

			} else {

				if(gf) {

					// Parse coupon ids string to array first
					var cids = [];
					try{

						var temp = req.body.coupons.trim();
						if(temp && temp.charAt(temp.length - 1) == ",")
							temp = temp.substring(0, temp.length - 2);
						cids = temp.split(",");

					} catch(e) {

						log.error(e);
						res.json( errorResInfo.INCORRECT_PARAMS.code , { 
							msg: "Incorrect format of coupons parameter!"
						}); 

					}
					
					// Find all coupons
					Coupon.find({

						_id : { $in : cids }

					}, function( err, coupons) {

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							}); 

						} else {

							var newRelationRecords = [];
							var bindingCoupons = [];
							var gfid = gf._id.toString();
							for(var k=0; k<coupons.length; k++) {
								var temp2 = {
									geofenceId: gfid,
									couponId: coupons[k].id.toString()									
								};
								newRelationRecords.push(temp2);
								bindingCoupons.push(coupons[k]);
							}	

							// Remove coupons first
							GeofenceCoupon.remove({

								geofenceId: gfid

							}, function(err){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: i18n.__('error.500Error')
									}); 

								} else {

									// Bind new coupons
									GeofenceCoupon.create(newRelationRecords, function(err, gcs){

										if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: i18n.__('error.500Error')
											}); 

										} else {

											var gfObj = formatObjectDate(gf);
											gfObj.coupons = bindingCoupons;
											res.json(errorResInfo.SUCCESS.code, gfObj);									

										}

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

}


// POST Interface of delete specific iBeacon device
exports.del = function(req, res){
	
	if(req.body._id){
		
		Geofence.findById( req.body._id, function(err, gf) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
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
										msg: i18n.__('error.500Error')
									}); 

	    						} else {

									// Remove gf
									gf.remove(function(err){
										
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

	    						}

	    					});

	    				} else {

                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
                				msg: i18n.__('error.403PermissionDeny')
                			});

	    				}	    					

	    			})
					
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


// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	ibdObj.updatedTime = moment(ibd.updatedTime).format("YYYY/MM/DD HH:mm Z").toString();		
	return ibdObj;
	
}