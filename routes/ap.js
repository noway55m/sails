var log = require('log4js').getLogger(), 
	utilityS = require("./utility"),
	Ap = require("../model/ap"),
	ApToFloor = require("../model/apToFloor"),
	Floor = require("../model/floor"),	
	Building = require("../model/building"),		
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config'),
	i18n = require("i18n");

//Static variable
var	errorResInfo = utilityS.errorResInfo;

// GET Interface for query building or floor by input aps
exports.queryBuildingAndFloor = function(req, res) {
	
	if(req.query.aps){
		
		var aps = req.query.aps,
			apsArray = aps.split(","), 
			floorCountCredit = {};
		
		for(var i=0; i<apsArray.length; i++){
			
			// Find appToFloor
			!function(ap, index){
				
				ApToFloor.find({
							
					apId: ap
					
				}, function(err, apToFloor){
					
					if(err){
						
		                log.error(err);
		                
						// Internal server error	                
						res.send(errorResInfo.INTERNAL_SERVER_ERROR.code, {
							msg: i18n.__('error.500Error') 
						});
											
					}else{
						
						// Update all floors credit
						if(apToFloor){							
							apToFloor.forEach(function(atf){
								
								if(floorCountCredit[atf.floorId])
									floorCountCredit[atf.floorId] ++;																															
								else	
									floorCountCredit[atf.floorId] = 1;														
								
							});														
						}
						
						// Calculate the most one
						if(index == apsArray.length - 1){
							
							console.log(floorCountCredit);
							getFloorWithBestCredit(floorCountCredit, function(err, result){
								log.info(result);
								res.json(errorResInfo.SUCCESS.code, result);
							});
							
						}
						
					}
					
				});
				
			}(apsArray[i], i);			
			
		}
				
	}
		
};

// Function calculate the best credit floor
function getFloorWithBestCredit(floorCountCredit, next) {

	var highestOne = [], highestScore = 0;

	// Find the highest score
	for ( var fcc in floorCountCredit) {
		if (floorCountCredit[fcc] > highestScore)
			highestScore = floorCountCredit[fcc];
	}
	log.info("highestScore: " + highestScore);

	// Find the floor with highest score 
	for ( var fcd in floorCountCredit) {
		if (floorCountCredit[fcd] >= highestScore)
			highestOne.push(fcd);
	}
	log.info("highest array:");
	log.info(highestOne);

	// Find the floors
	var query = {
		$or : []
	};
	highestOne.forEach(function(o) {
		var temp = {
			_id : o
		};
		query.$or.push(temp);
	});
	log.info("query string: " + query)
	log.info(query);

	// Find floors
	Floor.find(query, function(err, floors) {
		if (err) {

			log.error(err);
			next(err);

		} else {

			var cloneFloors = [];
			for ( var i = 0; i < floors.length; i++) {

				!function(index) {

					Building.findById(floors[index].buildingId, function(err,
							building) {

						if (err) {

							log.error(err);
							next(err);

						} else {
							
							// Clone and push to cloneFloors
							var cloneFloor = JSON.parse(JSON.stringify(floors[index]));
							cloneFloor.building = building;
							delete cloneFloor.buildingId;							
							cloneFloors.push(cloneFloor);

						}
						
						// Return result
						if (index == floors.length - 1)
							next(err, cloneFloors);

					});

				}(i);

			}

		}

	});

}