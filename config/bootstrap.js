var crypto = require('crypto'), 
	log = require('log4js').getLogger(), 
	User = require('../model/user'),
	Building = require('../model/building');

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
							building.save();
								
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
