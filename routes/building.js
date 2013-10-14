var log = require('log4js').getLogger(),
    User = require("../model/user"),
    Building = require("../model/building"),
    Floor = require("../model/floor"),
    Store = require("../model/store"),    
    Ad = require("../model/ad"),    
    crypto = require('crypto'),
    AdmZip = require('adm-zip'),
    archiver = require('archiver'),
    rimraf = require('rimraf'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../config/config');

// Static variable
var	mapinfo_path = "/" + config.mapInfoPath;

// GET Page for show specific building
exports.show = function(req, res) {
	res.render("building/building-show.html");
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

	if(req.body._id){
		
		// Find all stores
		Floor.find({
			
			buildingId: req.body._id
			
		}, function(err, floors){
			
			if(err)
				log.error(err);
			
			for(var i=0; i<floors.length; i++){
				
				Store.find({
					
					floorId: floors[i]._id
					
				}, function(err, stores){
					
					if(err)
						log.error(err);
					
					for(var j=0; j<stores.length; j++){		
						
						// Remove ad
						Ad.remove({
							
							storeId: stores[j].id
							
						}, function(err){					
							if(err)
								log.error(err);								
						});				
						
						// Remove store
						stores[j].remove();					
					}
					
				});
				
				// Remove floor
				floors[i].remove();
				
			}
			
			// Remove building folder
			var folderPath = path.dirname() + mapinfo_path + '/' + req.user._id + "/" + req.body._id;
			fs.exists(folderPath, function(exist){
				
				// Delete the folder removed floor 
				if(exist)
					rimraf(folderPath, function(err){
						if(err)
							log.error(err);
					});	
				
				// Remove building
				Building.findOneAndRemove({
				
					_id: req.body._id
				
				}, function(err){
					
					if(err)
						log.error(err);
					else
						res.send(200, {
							_id: req.body._id
						});
					
				});
				
			});
						
		});		
				
	}
	
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

									// Delete old image									
									var oldImgPath = path.resolve(config.imagePath + "/" + building.icon);
									fs.unlink(oldImgPath, function(err){
										log.error(err);
									});										
									
									building.icon = targetFileName;
									building.save(function(){
										res.send(200, targetFileName);
									});
								}
							});

							// Delete the temporary file
                            fs.unlink(tmpPath, function(err){
                            	log.error(err);
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

// Function for package map zip of all floors in specific building
exports.packageMapzip = function(req, res){
	
	Building.findById(req.body._id, function(err, building){
	
		if(err)
			log.error(err);
		
		if(building){
			
			var buildingFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + req.user.id + "/" + building.id,   
		 		zip = new AdmZip(),
		 		targetPath = req.user.id + "/" + building.id + "/map.zip";
			zip.addLocalFolder(buildingFolderPath);
			zip.writeZip(buildingFolderPath + "/map.zip", function(){
				
				building.mapzip = targetPath;
				building.save(function(err, building){
					
					if(err)
						log.error(err);
					
					if(building)
						res.send(200, building);				
					
				});
								
			});
			
		}
		
	});
	
	
};


// Function for package map zip of all floors in specific building
exports.packageMapzip = function(req, res){
	
	Building.findById(req.body._id, function(err, building){
	
		if(err)
			log.error(err);
		
		if(building){
			
			var buildingFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + req.user.id + "/" + building.id,   
		 		zip = new AdmZip(),
		 		targetPath = req.user.id + "/" + building.id + "/map.zip";
			
			// Check exist
			fs.exists(buildingFolderPath, function (exist) {
				
				
				if(exist){
					
					// Start to package map.zip
					zip.addLocalFolder(buildingFolderPath);
					zip.writeZip(buildingFolderPath + "/map.zip");
					
					// Update mapzip info of building
					building.mapzip = targetPath;
					building.mapzipUpdateTime = new Date();				
					building.save(function(err, building){
						
						if(err)
							log.error(err);
						
						if(building)
							res.send(200, building);				
						
					});					
					
				}else{
					
					res.json(200, { 
						msg: "No floor files have been uploaded before" 
					});
					
				}
			
			});
			
		}
		
	});
		
};


// Function for get map zip of all building
exports.getMapzip = function(req, res){
	
    if(req.query.mapzip){
    	
        try{
        	
            var fileName = req.query.mapzip,
	            filePath = path.dirname() + "/" + config.mapInfoPath + '/' + fileName,
	            stat = fs.statSync(filePath);
            res.writeHead(200, {
                "Content-type": "application/octet-stream",
                "Content-disposition": "attachment; filename=mapzip.zip",
                "Content-Length": stat.size
            });

            var readStream = fs.createReadStream(filePath);

            // We replaced all the event handlers with a simple call to util.pump()
            readStream.pipe(res);

        }catch(e){

            log.error(e);
            res.json(400, {
            	msg: "file doesn't exist"
            });             

        }
    }
	
};