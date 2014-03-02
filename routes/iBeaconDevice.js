var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	iBeaconDevice = require("../model/iBeaconDevice"),	
	iBeaconDeviceCoupon = require("../model/iBeaconDeviceCoupon"),
	Coupon = require("../model/coupon"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');


// GET Interface for list the iBeacon devices in specific floor
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

							iBeaconDevice.find( { 
							
								floorId: req.query.floorId
							
							}, function(err, ibds){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 							

								} else {
																										
									var ibdsObj = [];
									for(var i=0; i<ibds.length; i++)
										ibdsObj[i] = formatObjectDate(ibds[i]);			
									res.json( errorResInfo.SUCCESS.code, ibdsObj);

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
		
		iBeaconDevice.findById(req.params._id, function(err, ibd) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});	

			} else {

				if(ibd) {

					Floor.findById( ibd.floorId, function(err, floor){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});	

						} else {

							utilityS.validatePermission(req.user, floor, Floor.modelName, function(result) {

					    		if(result){

									res.json( errorResInfo.SUCCESS.code, ibd );

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

	if (req.body.deviceUid && req.body.floorId) {

		iBeaconDevice.findOne( {

			deviceUid: req.body.deviceUid 

		}, function(error, ibd) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( !ibd ) {

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

				    					// Create new iBeacon Device
										new iBeaconDevice({

										    deviceUid: req.body.deviceUid,
										    macAddress: req.body.macAddress,
										    name: req.body.name,
										    lat: req.body.lat,
										    lon: req.body.lon,
										    floorId: req.body.floorId,									    
										    createdTime: new Date(),
										    updatedTime: new Date()

										}).save(function(err, ibd) {

											if (err) {

												log.error(err);
												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
												});

											} else {

												if (ibd) {

													var ibdObj = formatObjectDate(ibd);
													res.json(errorResInfo.SUCCESS.code, ibdObj);

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

					res.json( errorResInfo.SUCCESS.code, {
						msg: "iBeacon device with device uid " + req.body.deviceUid + " is already exist!"
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

	if (req.body._id && req.body.deviceUid && req.body.floorId) {

		iBeaconDevice.findById( req.body._id, function(error, ibd) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( ibd ) {

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

								    ibd.deviceUid = req.body.deviceUid;

								    if(req.body.macAddress)
								    	ibd.macAddress = req.body.macAddress;
								    
								    ibd.name = req.body.name;
								    ibd.lat = req.body.lat;
								    ibd.lon = req.body.lon;
								    ibd.floorId = req.body.floorId;
								    ibd.updatedTime = new Date();
									ibd.save(function(err, ibd) {

										if (err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
											});

										} else {

											if (ibd) {

												var ibdObj = formatObjectDate(ibd);
												res.json(errorResInfo.SUCCESS.code, ibdObj);

											}

										}

									});

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
		
		iBeaconDevice.findById( req.body._id, function(err, ibd) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(ibd) {
					
	    			// Check permisssion
	    			utilityS.validatePermission(req.user, ibd, iBeaconDevice.modelName, function(result) {

	    				if(result) {
							
	    					// Remove relations between coupon and iBeacon device first
	    					iBeaconDeviceCoupon.remove({

	    						iBeaconDeviceId: req.body._id

	    					}, function(err) {

	    						if(err) {

									log.error(error);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

	    						} else {

									// Remove ibd
									ibd.remove(function(err){
										
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