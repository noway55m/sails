var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
    config = require('../config/config.js'),
    utilityS = require("./utility.js");

// Static variable
var errorResInfo = utilityS.errorResInfo;

// GET Interface for 404 error
exports.error404 = function(req, res){

	console.log("--- error 404 ---");

	var acceptType = req.accepts('html, json, text');
	console.log("acceptType: " + acceptType);

	// Respond with json
	if ( acceptType == 'json' ) {
		
		res.json( errorResInfo.NOT_FOUND.code, { 
			msg: errorResInfo.NOT_FOUND.msg
		});
		return;

	} else if( acceptType == 'html') {
		
		res.status(errorResInfo.NOT_FOUND.code);
		res.render('404.html', {
			user: null
		});
		return;

	} else {

		// Default text
		res.send(errorResInfo.NOT_FOUND.code, errorResInfo.NOT_FOUND.msg);
		return;

	}
	
};

// GET Interface for 500 error
exports.error500 = function(err, req, res, next){

	console.log("--- error 500 ---");
	console.log(err.status);
	console.log(err);

	var errorStatus = err.status || errorResInfo.INTERNAL_SERVER_ERROR.code;
	var acceptType = req.accepts('html, json, text');
	console.log("acceptType: " + acceptType);

	// Respond with html page
	if( acceptType =='json') {

		res.json( errorStatus, { 
			msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
		}); 
		return;

	} else if ( acceptType == 'html') {

		res.status(errorStatus);				
		res.render('500.html', {
			user: null
		});
		return;

	} else {

		// Default text
		res.send(errorStatus, errorResInfo.INTERNAL_SERVER_ERROR.msg);
		return;

	}

};