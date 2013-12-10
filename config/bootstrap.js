var crypto = require('crypto'), 
	log = require('log4js').getLogger(),
    fs = require('fs'),	
	path = require('path'),	 
	User = require('../model/user'),
	Store = require('../model/store'),	
	Floor = require('../model/floor'),
	Building = require('../model/building'),
	utilityS = require("../routes/utility.js"),
	config = require('../config/config');

module.exports = function() {

	// Create default administrator
	createDefaultUser();

};

// Function for create default administrator
function createDefaultUser() {
	
	// Generate default administrator
	User.findOne({

		username : "admin"

	}, function(err, user) {

		if (err)
			log.error(err);

		if (user) {

			log.info("Default user exist already");

			// Generate default 'MyHome' building
			Building.findOne({

				name: 'MyHome',
				userId: user._id

			}, function(err, building){

				if(err)
					log.error(err);

				if(building){

					log.info("Default building exist already");

				} else {

					new Building({

						name: "MyHome",						
						desc: "This is sample project",
						downfloor: 0,
						upfloor: 1,
						pub: true,
						userId: user._id					

					}).save(function(err, building){

						if(err)
							log.err(err);

						if(building){

							building.mapzip = "Sample/map.zip";
							building.mapzipUpdateTime = new Date();
							building.save(function(err, building){

								if(err)
									log.error(err);

								if(building){

									new Floor({

										name: "Sample Floor",
										desc: "This is a sample floor",
										layer: 1,
										map: "Sample/1/map.xml",
										path: "Sample/1/path.xml",
										region: "Sample/1/region.xml",
										render: "Sample/1/render.xml",
										mapzip: "Sample/1/map.zip",										
										lastXmlUpdateTime: new Date(),										
										buildingId: building._id,

									}).save(function(err, floor){

										if(err)
											log.error(err);

										if(floor){

											var sampleFolder = config.sampleBuildingPath + "/1/region.xml"

				                            // Start to parse region.xml
				                            fs.readFile(sampleFolder, 'utf8', function (err, data) {
				
				                                if(err)
				                                  log.error(err);
				
				                                if(data)
				                                    utilityS.parseRegion(data, floor._id);

				                            });

										}

									});

								}


							});
								
						}

					});

					log.info('Default building has been generated successfully');

				}

			});

		} else {

			new User({

				username : "admin",
				password : User.encodePassword("Admin123"),
				role: 1,
				enabled: true,
				token: User.genToken()
				
			}).save();

			log.info('Default user has been generated successfully');

		}

	});

}
