var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
	DeveloperApplication = require("../model/developerApplication"),
	path = require('path'),
	util = require('util'),
	config = require('../config/config');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page for show apps of developer
exports.appIndex = function(req, res) {
	res.render("developer/app-index.html");
};

// GET Interface for list apps of developer
exports.appList = function(req, res) {
};

// POST Interface for create new app
exports.appCreate = function(req, res) {

	if(req.body.verifier && req.body.type) {

		new DeveloperApplication({

			apiKey: DeveloperApplication.genApiKey(),
			type: req.body.type,
			verifier: req.body.verifier,
			createdTime: new Date(),
			updatedTime: new Date(),			
			userId: req.user._id

		}).save(function(err, developerApplication){

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 				

			} else {

				res.json( errorResInfo.SUCCESS.code, developerApplication );

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

};

// POST Interface for update specific app
exports.appUpdate = function(req, res) {

	if(req.body._id && req.body.verifier) { 

		DeveloperApplication.findById(req.body._id, function(err, developerApplication) {

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				developerApplication.verifier = req.body.verifier;
				developerApplication.save(function(err, developerApplication){

					if(err) {

						log.error(error);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						}); 

					} else {

						res.json( errorResInfo.SUCCESS.code, developerApplication);

					}

				});

			}

		});


	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});

	}

};

// POST Interface for delete specific app
exports.appDelete = function(req, res) {

	if(req.body._id) {	

		DeveloperApplication.findById(req.body._id, function(err, developerApplication) {

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				developerApplication.remove(function(err){

					if(err) {

						log.error(error);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						}); 

					} else {

						res.json( errorResInfo.SUCCESS.code, { _id: req.body._id });

					}

				});

			}

		});


	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

};

// POST Interface for refresh app token
exports.appRegenerateKey = function(req, res) {

	if(req.body._id) {

		DeveloperApplication.findById(req.body._id, function(err, developerApplication) {

			if(err) {

				log.error(error);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

			} else {

				developerApplication.apiKey = DeveloperApplication.genApiKey();
				developerApplication.save(function(err, developerApplication){

					if(err) {

						log.error(error);
						res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
							msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						}); 

					} else {

						res.json( errorResInfo.SUCCESS.code, developerApplication);

					}

				});

			}

		});

	} else {

		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		}); 

	}

};
