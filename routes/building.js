var log = require('log4js').getLogger(),
    User = require("../model/user"),
    Building = require("../model/building"),
    Floor = require("../model/floor"),
    crypto = require('crypto'),
    fs = require('fs'),
	path = require('path'),
	util = require('util');


// Static variable
var	resource_path = "./resource/",
	public_image_path = "client-image",
	mapzip_path = resource_path + "mapzip",
	image_path = "public/" + public_image_path;

/*
 * GET Page of specific building
 */
exports.index = function(req, res) {

	Building.findById(req.params.id, function(err, building) {

		if (err)
			log.error(err);

		if (building) {

			Floor.find({

				buildingId: building.id

			}).sort({layer: -1}).execFind(function(error, floors){

				if (err)
					log.error(err);

				var floorUp = [];
				var floorDown = [];
				floors.forEach(function(floor){

					if(floor.layer >0 )
						floorUp.push(floor);
					else
						floorDown.push(floor);

				});

				res.render("building/index.html", {
					url: req.url.toString(), // use in layout for identify display info
					user: req.user,
					building: building,
					floorUp: floorUp,
					floorDown: floorDown,
					imagePath: public_image_path
				});

			});

		}

	});

};


/*
 * GET Interface of list buildings or buildings of specific user
 */
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


/*
 * POST Interface of create new building
 */
exports.create = function(req, res) {

    if(req.body.name){

        new Building({

            name: req.body.name,
            desc: req.body.desc,
            userId: req.user.id,
            pub: false

        }).save(function(err, building){

            if(building){

                res.send(200, {
                    building: building
                });

            }else{

                res.send(400, {
                    msg: "Server error"
                });

            }// end if

        });

    }

};


/*
 * GET Interface for get building info
 */
exports.read = function(req, res){

    // Get building
    Building.findById(req.params.id, function(err, building) {

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


/*
 * POST Interface of update specific building
 */
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


/*
 * GET Interface of delete specific building
 */
exports.del = function(req, res) {

};


/*
 * GET Interface for get mapzip file of specific building
 */
exports.getMapzip = function(req, res){

    if(req.params.filename){

        var fileName = req.params.filename,
            filePath = mapzip_path + "/"+ fileName;
            stat = fs.statSync(filePath);

        try{

            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=" + fileName,
                "Content-Length": stat.size
            });

            var readStream = fs.createReadStream(filePath);

            // We replaced all the event handlers with a simple call to util.pump()
            // util.pump(readStream, res);
            readStream.pipe(res);

        }catch(e){

            log.error(e);

        }
    }

}

/*
 * POST Interface for upload mapzip
 */
exports.uploadMapzip = function(req, res) {

	if(req.body.id && req.files.mapzip){

		// Get file name and extension
		var fileName = req.files.mapzip.name;
		var extension = path.extname(fileName).toLowerCase() === '.zip' ? ".zip" : null ||
						path.extname(fileName).toLowerCase() === '.rar' ? ".rar" : null;

		// Check file format by extension
		if(extension){

			var tmpPath = req.files.mapzip.path;
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
				var targetPath = path.resolve(mapzip_path + "/" + targetFileName);
				log.info("targetPath: " + targetPath);

				Building.findById(req.body.id, function(error, building){

					if(building){

						log.info("mapzip: " + building.mapzip);
						log.info("targetName: " + targetFileName);
						if(building.mapzip != targetFileName){

							log.info("Update");
							fs.rename(tmpPath, targetPath, function(err) {
								if(err){
									log.error(err);
									res.send(200, "Server error, please try again later");
								}else{

									building.mapzip = targetFileName;
									building.mapzipUpdateTime = new Date();
									building.save(function(){
										res.send(200, building.mapzipUpdateTime.toString());
									});
								}
							});

						}else{

							log.info("Same");
							res.send(200, building.mapzipUpdateTime.toString());
						}

					}else{

						res.send(200, { msg: "This building does not exist" });

					}//end if

				});

			});

		}else{

			res.send(200, { msg: "File extension should be .zip or .rar." });
		}

	}

};

/*
 * POST Interface of upload image
 */
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
				var targetPath = path.resolve(image_path + "/" + targetFileName);
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
									res.send(200, "Server error, please try again later");
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

