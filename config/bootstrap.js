var crypto = require('crypto'), 
	log = require('log4js').getLogger(), 
	User = require('../model/user');

module.exports = function() {

	// Create default administrator
	createDefaultUser();

};

// Function for create default administrator
function createDefaultUser() {
	
	// Check duplicate user
	User.findOne({

		username : "admin"

	}, function(err, user) {

		if (err)
			log.error(err);

		if (user) {

			log.info("Default user exist already");

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
