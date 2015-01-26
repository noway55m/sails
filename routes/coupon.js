var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	User = require("../model/user"),	
	iBeaconDevice = require("../model/iBeaconDevice"),	
	iBeaconDeviceCoupon = require("../model/iBeaconDeviceCoupon"),
	Coupon = require("../model/coupon"),
	GeofenceCoupon = require("../model/geofenceCoupon"),		
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config'),
	i18n = require("i18n");

// Static variable
var	errorResInfo = utilityS.errorResInfo;


// GET Interface for list coupons of specific user
exports.list = function(req, res) {

    // Check user role for check with administration permission
    var queryJson = null;
    if(req.user.role !== User.ROLES.ADMIN)
        queryJson = { userId: req.user.id };

	Coupon.find(queryJson, function(err, coupons) {

		if(err) {

			log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: i18n.__('error.500Error')
			}); 

		} else {

			var couponsObj = [];
			for(var i=0; i<coupons.length; i++)
				couponsObj[i] = formatObjectDate(coupons[i]);			
			res.json( errorResInfo.SUCCESS.code, couponsObj);

		}

	});	

};


// GET Interface for read specific coupon
exports.read = function(req, res){
	
	if(req.params._id) {
		
		Coupon.findById(req.params._id, function(err, coupon) {

			if (err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				// check permission
				if(req.user.role !== User.ROLES.ADMIN || coupon.userId == req.user.id) {

					res.json( errorResInfo.SUCCESS.code, coupon );

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
	
};


// POST Interface for create the new coupon
exports.create = function(req, res) {

	if (req.body.name) {

		new Coupon({

			name: req.body.name,
		    desc: req.body.desc,
		    link: req.body.link,
		    userId: req.user.id,
		    createdTime: new Date(),
		    updatedTime: new Date() 			

		}).save(function(err, coupon){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				});	

			} else {

				// TODO : Add geofence and iBeaconDevice

				log.error(err);
				res.json( errorResInfo.SUCCESS.code , coupon);	

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: i18n.__('error.400IncorrectParams')
		}); 

	}


};


// POST Interface for update coupon
exports.update = function(req, res) {

	if (req.body._id) {

		Coupon.findById( req.body._id, function(error, coupon) {

			if(error) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 				

			} else {

				if( coupon ) {

					// Check permisssion
					if(req.user.role !== User.ROLES.ADMIN || coupon.userId == req.user.id) {
					    
					    coupon.name = req.body.name;
					    coupon.desc = req.body.desc;
					    coupon.link = req.body.link;
					    coupon.updatedTime = new Date();
						coupon.save(function(err, coupon) {

							if (err) {

								log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: i18n.__('error.500Error')
								});

							} else {

								if (coupon) {

									var couponObj = formatObjectDate(coupon);
									res.json(errorResInfo.SUCCESS.code, couponObj);

								}

							}

						});

	    				
					} else {

	        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
	        				msg: i18n.__('error.403PermissionDeny')
	        			});

					}		    			

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

// POST Interface of delete specific iBeacon device
exports.del = function(req, res){
	
	if(req.body._id){
		
		Coupon.findById( req.body._id, function(err, coupon) {
			
			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: i18n.__('error.500Error')
				}); 

			} else {

				if(coupon) {
					
	    			// Check permisssion
	    			if(req.user.role !== User.ROLES.ADMIN || coupon.userId == req.user.id) {
	    										
    					// Remove relations between coupon and iBeacon device and Geofence first
    					iBeaconDeviceCoupon.remove({

    						couponId: req.body._id

    					}, function(err) {

    						if(err) {

								log.error(error);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: i18n.__('error.500Error')
								}); 

    						} else {

    							GeofenceCoupon.remove({
									
									couponId: req.body._id

    							}, function(err) {

		    						if(err) {

										log.error(error);
										res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
											msg: i18n.__('error.500Error')
										}); 

		    						} else {

										// Remove coupon
										coupon.remove(function(err){
											
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

    						}

    					});	    					    					

	    			} else {

            			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
            				msg: i18n.__('error.403PermissionDeny')
            			});

	    			}
					
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