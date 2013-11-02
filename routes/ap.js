var log = require('log4js').getLogger(), 
	utilityS = require("./utility"),
	Ad = require("../model/ad"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	config = require('../config/config');

// Static variable
var	image_path = config.imagePath;

// GET Interface for query building or floor by input aps
exports.queryBuildingAndFloor = function(req, res) {
	
	console.log(req.query.aps);
	if(req.query.aps){
		
		
		
		
	}
	
	
};