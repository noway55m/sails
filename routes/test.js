var log = require('log4js').getLogger(),
	utilityS = require("./utility"),
	User = require("../model/user"),
	Building = require("../model/building"),				
	Poi = require("../model/poi"),	
	PoiTag = require("../model/poiTag"),	
	fs = require('fs'),
	path = require('path'),
	mkdirp = require("mkdirp"),
	config = require('../config/config');



/*
 * GET home page.
 */

exports.test1 = function(req, res){
	console.log('test1')
	console.log(req.user);
};

exports.test2 = function(req, res){
	console.log('test2')
};

exports.ll = function(req, res){

	Building.find({}, "_id", function(err, buildings){

		if(err)
			log.error(err);

		res.json(buildings);

	})

};