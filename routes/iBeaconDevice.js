var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	Floor = require("../model/floor"),	
	iBeaconDevice = require("../model/iBeaconDevice"),	
	iBeaconDeviceCoupon = require("../model/iBeaconDeviceCoupon"),
	Coupon = require("../model/coupon"),	
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo;


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
											
					                var ids = [];
					                for(index in ibds){
				                        var ibd = ibds[index];
				                        ids.push(ibd._id.toString());
					                }

					                // Find all coupons
					                iBeaconDeviceCoupon.find({

					                    iBeaconDeviceId: { $in: ids }

					                }, function(err, ibdcs){ 

					                	if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
											}); 

					                	} else {

							                var cids = [];
							                for(index in ibdcs){
						                        var ibdc = ibdcs[index];
						                        cids.push(ibdc.couponId);
							                }

					                		Coupon.find({

					                			_id: { $in: cids }

					                		}, function(err, coupons){

					                			if(err) {

													log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
													});

					                			} else {

					                				var ibdsObj = [];
					                				for(var m=0; m<ibds.length; m++) {

					                					ibdsObj[m] = formatObjectDate(ibds[m]);	
					                					var theCoupons = [];

						                				for(var k=0; k<ibdcs.length; k++) {

						                					if(ibds[m]._id.toString() == ibdcs[k].iBeaconDeviceId){
						                						for(var l=0; l<coupons.length; l++) {
						                							if(ibdcs[k].couponId == coupons[l]._id.toString()){
						                								theCoupons.push(coupons[l]);
						                								break;
						                							}
						                						}
						                					}						                					

						                				}

						                				ibdsObj[m].coupons = theCoupons;

						                			}

						                			res.json( errorResInfo.SUCCESS.code, ibdsObj);

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
	
	if(req.params.deviceUid) {
		
		iBeaconDevice.findOne( {

			deviceUid: req.params.deviceUid 

		}, function(err, ibd) {

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

					    			iBeaconDeviceCoupon.find({

					    				iBeaconDeviceId: ibd._id.toString()

					    			}, function(err, ibdcs){

					    				if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
											});	

					    				} else {

			    							var ids = [];
			    							for(var n=0; n<ibdcs.length; n++)
			    								ids.push(ibdcs[n].couponId);

			    							Coupon.find({

			    								_id: { $in: ids }

			    							}, function(err, cps) {

			    								if(err) {

													log.error(err);
													res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
														msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
													});	

			    								} else {

							    					var ibdObj = JSON.parse(JSON.stringify(ibd));
							    					ibdObj.coupons = cps;
							    					res.json( errorResInfo.SUCCESS.code, ibdObj );

			    								}

			    							});

					    				}

					    			});

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

	if (req.body.deviceUid) {

		iBeaconDevice.findOne( {

			deviceUid: req.body.deviceUid

		}, function(error, ibd) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				if( ibd ) {

					Floor.findById( ibd.floorId, function(err, floor){

						if(err) {

							log.error(error);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

						} else {

							// Check permisssion
			    			utilityS.validatePermission(req.user, floor, Floor.modelName, function(result){

			    				if(result) {

			    					if(req.body.deviceUid)
								    	ibd.deviceUid = req.body.deviceUid;

								    if(req.body.macAddress)
								    	ibd.macAddress = req.body.macAddress;
								    
								    ibd.name = req.body.name;
								    ibd.lat = req.body.lat;
								    ibd.lon = req.body.lon;
								    
								    if(req.body.floorId)
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

// POST Interface for create or update relation between iBeaconDevice and Coupon
exports.bindCoupons = function(req, res) {

	if(req.body.deviceUid && req.body.coupons) {

		iBeaconDevice.findOne( { 

			deviceUid: req.body.deviceUid 

		}, function(err, ibd) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(ibd) {

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
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

						} else {

							var newRelationRecords = [];
							var bindingCoupons = [];
							var ibdid = ibd._id.toString();
							for(var k=0; k<coupons.length; k++) {
								var temp2 = {
									iBeaconDeviceId: ibdid,
									couponId: coupons[k].id.toString()									
								};
								newRelationRecords.push(temp2);
								bindingCoupons.push(coupons[k]);
							}	

							// Remove coupons first
							iBeaconDeviceCoupon.remove({

								iBeaconDeviceId: ibdid

							}, function(err){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 

								} else {

									// Bind new coupons
									iBeaconDeviceCoupon.create(newRelationRecords, function(err, gcs){

										if(err) {

											log.error(err);
											res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
												msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
											}); 

										} else {

											var ibdObj = formatObjectDate(ibd);
											ibdObj.coupons = bindingCoupons;
											res.json(errorResInfo.SUCCESS.code, ibdObj);									

										}

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

}


// POST Interface of delete specific iBeacon device
exports.del = function(req, res){
	
	if(req.body.deviceUid){
		
		iBeaconDevice.findOne( req.body.deviceUid, function(err, ibd) {
			
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
												deviceUid: req.body.deviceUid
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