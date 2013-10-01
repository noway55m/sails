var log = require('log4js').getLogger(),
    Floor = require("../model/floor"),
    Building = require("../model/building"),
    fs = require('fs'),
	path = require('path');
/*
 * GET Interface for read specific floor
 */
exports.read = function(req, res) {

}

/*
 * GET Interface for list floors of specific building
 */
exports.list = function(req, res) {

	Floor.find({

		buildingId: req.query.buildingId

	}).sort({layer: -1}).execFind(function(error, floors){

		if (error)
			log.error(error);

		res.send(200, floors);

	});

}


/*
 * POST Interface for create floor of building
 */
exports.create = function(req, res) {

	if(req.body.buildingId && req.body.layer){

		new Floor({

			layer: req.body.layer,

			buildingId: req.body.buildingId

		}).save(function(error, floor){

			Building.findById(req.body.buildingId, function(error, building){

				if(req.body.layer>0)
					building.upfloor = req.body.layer;
				else
					building.downfloor = Math.abs(req.body.layer);

				building.save(function(){
					res.send(200, floor);
				});

			});

		});

	}

}

/*
 * POST Interface for update floor of building
 */
exports.update = function(req, res) {

}