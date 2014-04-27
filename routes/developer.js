var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
	User = require("../model/user"),
	path = require('path'),
	util = require('util'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page for show apps of developer
exports.appIndex = function(req, res) {
	res.render("building/building-show.html");
};

// GET Interface for list apps of developer
exports.appList = function(req, res) {
};

// POST Interface for create new app
exports.appCreate = function(req, res) {
};

// POST Interface for update specific app
exports.appUpdate = function(req, res) {
};

// POST Interface for delete specific app
exports.appDelete = function(req, res) {
};

// POST Interface for refresh app token
exports.appRefreshToken = function(req, res) {
};
