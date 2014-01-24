var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("../utility.js"),
    Feedback = require("../../model/feedback"),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../../config/config'),
	builder = require('xmlbuilder');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// Feedback Index Page
exports.index = function(req, res) {
	res.render("admin-view/feedback/index.html");	
};

// GET Interface of list all feedbacks
exports.list = function(req, res) {

	// Pagination params
	var page = ( req.query.page && req.query.page > 0 ? req.query.page - 1 : 0 ) || 0;
    var queryJson = null;
    Feedback.find(queryJson)
		.sort({ createdTime: -1 })
		.limit(config.pageOffset)
		.skip(page * config.pageOffset).exec( function(err, feedbacks){

        if(err){

            log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  		

		} else {

			// Get feedbacks count
			Feedback.count( queryJson, function(err, count) {

				if( err ) {

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
					});  		

				} else {

			        res.send(errorResInfo.SUCCESS.code, {						        	
			        	page: page + 1,
			        	offset: config.pageOffset,
			        	count: count,
			        	feedbacks: feedbacks
			        });
									
				}

			} );			
    	
    	}		

    });

};