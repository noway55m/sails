var log = require('log4js').getLogger(),
    User = require("../model/user"),
    Building = require("../model/building"),
    Floor = require("../model/floor"),
    crypto = require('crypto'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../config/config');

// GET Page for show specific building
exports.show = function(req, res) {

	Building.findById(req.params._id, function(err, building) {

		if (err)
			log.error(err);

		if (building)
			res.render("building/building-show.html", {
				building: building
			});

	});

};

// Get Interface of list public buildings
exports.listPublic = function(req, res){

    Building.find({

        pub : true

    }, function(err, buildings) {

        if (err)
            log.error(err);

        res.send(200, buildings);
    });

};

// GET Interface of list buildings or buildings of specific user
exports.list = function(req, res) {

    // Check user role for check with administration permission
    var queryJson = null;
    if(req.user.role !== 1)
        queryJson = { userId: req.user.id };

    Building.find(queryJson, function(err, buildings){

        if(err)
            log.error(err);

        res.send(200, buildings);
    });

};

// POST Interface of create new building
exports.create = function(req, res) {

    if(req.body.name){

        new Building({

            name: req.body.name,
            desc: req.body.desc,
            userId: req.user._id,
            pub: false

        }).save(function(err, building){

            if(building){

                res.send(200, building);

            }else{

                res.send(400, {
                    msg: "Server error"
                });

            }// end if

        });

    }

};

// GET Interface for get building info
exports.read = function(req, res){

    // Get building
    Building.findById(req.params._id, function(err, building) {

        if(err)
            log.error(err);

        if(building){

            // Check permission
            if(building.userId == req.user.id || req.user.role == 1)
                res.send(200, building);
            else
                res.send(400, { msg: "You have no permission to access building: " + building.id });
        }

    });

};

// POST Interface of update specific building
exports.update = function(req, res) {

    if(req.body._id){

        // Get building
        Building.findById(req.body._id, function(err, building){

            if(err)
                log.error(err);

            if(building){

                // Check permission
                if(building.userId == req.user.id || req.user.role == 1){
                    building.name = req.body.name;
                    building.desc = req.body.desc;
                    building.pub = req.body.pub;
                    building.save(function(){
                        res.send(200, building);
                    });
                }else{
                    res.send(400, { msg: "You have no permission to access building: " + building.id });
                }

            }

        });

    }

};

// GET Interface of delete specific building
exports.del = function(req, res) {

};

// POST Interface of upload image
exports.uploadImage = function(req, res) {

	console.log(req.body);
	if(req.body._id && req.files.image){

		// Get file name and extension
		var fileName = req.files.image.name;
		var extension = path.extname(fileName).toLowerCase() === '.png' ? ".png" : null ||
						path.extname(fileName).toLowerCase() === '.jpg' ? ".jpg" : null ||
						path.extname(fileName).toLowerCase() === '.gif' ? ".gif" : null;

		console.log(extension);

		// Check file format by extension
		if(extension){

			var tmpPath = req.files.image.path;
			log.info("tmpPath: " + tmpPath);

			// Read file and prepare hash
			var md5sum = crypto.createHash('md5'),
				stream = fs.ReadStream(tmpPath);

			// Set target file name by hash the file
			var targetFileName;
			stream.on('data', function(d) {
				md5sum.update(d);
			});

			stream.on('end', function() {

				targetFileName = md5sum.digest('hex')  + extension;
				var targetPath = path.resolve(config.imagePath + "/" + targetFileName);
				log.info("targetPath: " + targetPath);

				Building.findById(req.body._id, function(error, building){

					if(building){

						log.info("icon: " + building.icon);
						log.info("targetName: " + targetFileName);
						if(building.icon != targetFileName){

							log.info("Update");
							fs.rename(tmpPath, targetPath, function(err) {
								if(err){
									log.error(err);
									res.send(200, {
									    msg: "Server error, please try again later"
									});
								}else{

									building.icon = targetFileName;
									building.save(function(){
										res.send(200, targetFileName);
									});
								}
							});

						}else{

							log.info("Same");
							res.send(200, targetFileName);
						}

					}else{

						res.send(200, { msg: "This building does not exist" });

					}//end if

				});

			});

		}else{

			res.send(200, { msg: "File extension should be .png or .jpg or gif" });
		}


	}

};

