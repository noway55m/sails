var log = require('log4js').getLogger(),
	moment = require('moment'), 
	utilityS = require("./utility"),
	Floor = require("../model/floor"),
	MobileDevice = require("../model/mobileDevice"),	
	IndoorLocationRecord = require("../model/indoorLocationRecord"),
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo;


// GET Interface for list indoor location records of specific mobile device
exports.list = function(req, res) {

	if (req.query.mdUid) {

		MobileDevice.findOne( {

			mdUid: req.query.mdUid

		}, function(err, md) {

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(md) {

					// TODO: Check permission, for now we haven't finish binding the relation between user
					// and mobile device, so not add permission control for now 

					// Pagination params
					var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;

					var queryJson = {};
					queryJson.mdUid = md.mdUid;
					queryJson.timestamp = {};

					// Parse start date
					if(req.query.startDate) {
						
						try {

							var dateFormat = req.query.startDate.split("/");
							var month = dateFormat[1];					
							if(month.charAt(0) == "0")
								month = month.replace("0", "");
							var monthInt = parseInt(month);
							if(monthInt)
								monthInt--;

							queryJson.timestamp["$gte"] = new Date(dateFormat[0], monthInt, dateFormat[2]);

						} catch(e) {

							log.error(e);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: "Incorrect end date format - need to be 'yyyy/mm/dd'"
							});

						}

					}

					// Parse end date
					if(req.query.endDate) {
						
						try {

							var dateFormat2 = req.query.endDate.split("/");
							var month = dateFormat[1];
							if(month.charAt(0) == "0")
								month = month.replace("0", "");
							var monthInt = parseInt(month);
							if(monthInt)
								monthInt--;

							queryJson.timestamp["$lte"] = new Date(dateFormat2[0], monthInt, dateFormat2[2]);

						} catch(e) {

							log.error(e);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: "Incorrect end date format - need to be 'yyyy/mm/dd'"
							});

						}

					}

					console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
					console.log(queryJson);
					IndoorLocationRecord.count(queryJson, function(err, count){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

						} else {

							console.log("@@@@@@@@@@@@@@@@@@@@@@");
							console.log(count);

							IndoorLocationRecord.find(queryJson)
								.sort({ createdTime: -1 })
								.limit(400)
								.skip(page * 400).exec(function(err, ilrs){

								if(err) {

									log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									}); 							

								} else {
																										
									res.json( errorResInfo.SUCCESS.code, {
							        	page: page + 1,
							        	offset: 400,
							        	count: count,
							        	locations: ilrs								
									});

								}

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


// POST Interface for upload location record from mobile device
exports.upload = function(req, res) {

	if ( req.body.lat && req.body.lon && req.body.mdUid && req.body.floorId) {

		Floor.findById(req.body.floorId, function(err, floor){

			if(err) {

				log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				if(floor) {

					new IndoorLocationRecord({

						lat: req.body.lat,
					    lon: req.body.lon,
					    floorId: req.body.floorId,		    
					    mdUid: req.body.mdUid,
					    timestamp: new Date(),

					}).save(function(err, ilr){

						if(err) {

							log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});	

						} else {

							log.error(err);
							res.json( errorResInfo.SUCCESS.code , ilr);	

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


// Function for clone object and format time
function formatObjectDate(ibd){

	var ibdObj = JSON.parse(JSON.stringify(ibd));
	ibdObj.createdTime = moment(ibd.createdTime).format("YYYY/MM/DD HH:mm Z").toString();
	ibdObj.updatedTime = moment(ibd.updatedTime).format("YYYY/MM/DD HH:mm Z").toString();		
	return ibdObj;
	
}