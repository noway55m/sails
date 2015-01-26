var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	MobileDevice = require("../model/mobileDevice"),	
	User = require("../model/user"),
	UserMobileDevice = require("../model/userMobileDevice"),			
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config'),
	i18n = require("i18n");

// Static variable
var	errorResInfo = utilityS.errorResInfo;


// GET Interface for read specific iBeaconDevice
exports.read = function(req, res){
	
	if(req.params.mdUid) {
		
		MobileDevice.findOne( {

			mdUid: req.params.mdUid 

		}, function(err, md) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				if(md) {

					// Check permission
					UserMobileDevice.findOne({

						userId: req.user._id.toString(),
						mobileDeviceId: md._id.toString()

					}, function(err, umd){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});	

						} else {

							if(umd || req.user.role == User.ROLES.ADMIN) {

								var mdObj = formatObjectDate(md);
								res.json(errorResInfo.SUCCESS.code, mdObj);

							} else {

	                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
	                				msg: i18n.__('error.403PermissionDeny')
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
			
		});			
		
	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}
	
};


// POST Interface for create the new mobile device
exports.create = function(req, res) {

	if (req.body.mdUid) {

		MobileDevice.findOne( {

			mdUid: req.body.mdUid 

		}, function(error, md) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 				

			} else {

				if( !md ) {

					// Create new mobile Device
					new MobileDevice({

					    mdUid: req.body.mdUid,
					    macAddress: req.body.macAddress,
					    osType: req.body.osType,
					    createdTime: new Date()

					}).save(function(err, md) {

						if (err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});

						} else {

							// Check user login or not
							if(req.user && req.user._id.toString()) {

								UserMobileDevice.findOne({

									userId: req.user._id.toString(),
									mobileDeviceId: md._id.toString()

								}, function(err, umd) {

									if(err) {

										log.error(err);

									} else {

										new UserMobileDevice({

											userId: req.user._id.toString(),
											mobileDeviceId: md._id.toString()

										}, function(err, umd){

											if(err) {

												log.error(err);
											
											}

										});

									}

								});

							}

							var mdObj = formatObjectDate(md);
							res.json(errorResInfo.SUCCESS.code, mdObj);

						}

					});

				} else {

					res.json( errorResInfo.SUCCESS.code, {
						msg: "iBeacon device with mobile device uid " + req.body.mdUid + " is already exist!"
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


// POST Interface of delete mobile device
exports.del = function(req, res){
	
	if(req.body.mdUid){
		
		MobileDevice.findOne( req.body.mdUid, function(err, md) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 

			} else {

				if(md) {
					
	    			// Check permisssion
					UserMobileDevice.findOne({

						userId: req.user._id.toString(),
						mobileDeviceId: md._id.toString()

					}, function(err, umd){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: i18n.__('error.500Error')
							});	

						} else {

							if(umd || req.user.role == User.ROLES.ADMIN) {

								// Remove relations between coupon and iBeacon device first
								UserMobileDevice.remove({

									mobileDeviceId: md._id.toString()

								}, function(err) {

									if(err) {

										log.error(error);
										res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
											msg: i18n.__('error.500Error')
										}); 

									} else {

										// Remove location record
										IndoorLocationRecord.remove({

											mdUid: req.body.mdUid

										}, function(err){

											if(err) {

												res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
													msg: i18n.__('error.500Error')
												}); 

											} else {

												md.remove(function(err){
													
													if(err) {

														log.error(error);
														res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
															msg: i18n.__('error.500Error')
														}); 

													} else {

														res.json( errorResInfo.SUCCESS.code, {
															deviceUid: req.body.mdUid
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

						}

					});										    				    					

        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
        				msg: i18n.__('error.403PermissionDeny')
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


// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	return ibdObj;
	
}