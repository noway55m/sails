var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("./utility.js"),
    mkdirp = require("mkdirp"),
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
	config = require('../config/config'),
	builder = require('xmlbuilder'),
	archiver = require('archiver');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

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

            if(err){
            	
                log.error(err);
    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
    			});            	            	
                                
            }else{

                if(building){
                	
                	utilityS.validatePermission(req.user, building, Building.modelName, function(result){

                		if(result){
                			
                            building.name = req.body.name;
                            building.desc = req.body.desc;
                            building.pub = req.body.pub;
                            building.address = req.body.address;
                            building.save(function(){
                                res.json(200, building);
                            });            			
                			
                		}else{
                			
                			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
                				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
                			});
                			
                		}         		
                		
                	});
                	
                }else{
                	
        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			});            	            	
                	                	
                }            	
            	            	
            }

        });

    }

};

// GET Interface of delete specific building
exports.del = function(req, res) {

	if(req.body._id){
				
		// Remove building folder
		var folderPath = path.dirname() + mapinfo_path + '/' + req.user._id + "/" + req.body._id;
		fs.exists(folderPath, function(exist){
			
			// Delete the folder removed floor 
			if(exist)
				rimraf(folderPath, function(err){
					if(err)
						log.error(err);
				});	
			
			// Find building
			Building.findById(req.body._id, function(err, building){
				
				if(err)
					log.error(err);
				
				if(building){
					
					// Remove building icon
					if(building.icon){
						var oldImgPath = path.resolve(image_path + "/" + building.icon);
						fs.unlink(oldImgPath, function(err){
							log.error(err);
						});	
					}							
					
					// Remove building
					building.remove(function(err){
						if(err)
							log.error(err);
						else
							res.send(200, {
								_id: req.body._id
							});
							
					});
										
				}
				
			});
			
		});		
		
		// Find all floors
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
						Ad.find({
							
							storeId: stores[j].id
							
						}, function(err, ads){					
							
							if(err)
								log.error(err);
							
							for(var k=0; k<ads.length; k++){
								
								// Delete ad image if exist
								if(ads[k].image){
									var oldImgPathAd = path.resolve(image_path + "/" + ads[k].image);
									fs.unlink(oldImgPathAd, function(err){
										log.error(err);
									});	
								}
								
								// Remove ad
								ads[k].remove(function(err){
									log.error(err);
								});						
								
							}
												
						});			
												
						// Delete store icon if exist
						if(stores[j].icon){
							var oldImgPath = path.resolve(image_path + "/" + stores[j].icon);
							fs.unlink(oldImgPath, function(err){
								log.error(err);
							});	
						}							
						
						// Remove store
						stores[j].remove(function(err){
							log.error(err);
						});
						
					}
					
				});
				
				// Remove floor
				floors[i].remove(function(err){
					log.error(err);
				});
				
			}
									
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

									// Delete old image if exist
									if(building.icon){
										var oldImgPath = path.resolve(config.imagePath + "/" + building.icon);
										fs.unlink(oldImgPath, function(err){
											log.error(err);
										});
									}
									
									// Update building
									building.icon = targetFileName;
									building.save(function(){
										res.send(200, targetFileName);
									});
									
									// Delete the temporary file
		                            fs.unlink(tmpPath, function(err){
		                            	log.error(err);
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

// Function for package map zip of all floors in specific building
exports.packageMapzip = function(req, res){
	
	if(req.body._id){
	
		Building.findById(req.body._id, function(err, building){
		
			if(err){
				
				log.error(err);
    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
    			});				 
				
			} else {
	
				if(building){
					
					// Get all floors
					Floor.find({
						
						buildingId: building.id
						
					}).sort({layer: 1}).execFind( function(err, floors){
						
						if(err){
							
							log.error(err);
		        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
		        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
		        			});					
							
						}else{
							
							// Main Folder path
							var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId,
								buildingFolderPath = folderPath + "/" + building.id;   
				 								
							// Make sure folder path exist, if not created
							mkdirp(folderPath, function(err, dd) {
								
								if(err){
									
									log.error(err);
				        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				        			});										
									
								}else{
																
									// Construct floorlist.xml
									var floorListTag = builder.create('FloorList', {
											'location': '',
											'version': '1.0', 
											'encoding': 'UTF-8',
											'standalone': 'yes'
									});
									
									for(var i=0; i<floors.length; i++)
										floorListTag.ele('floor', {
											'name': floors[i].layer,
											'desc': floors[i].name ? floors[i].name : '',
											'number': floors[i].layer,
											'id': floors[i].id
										});
									
									var floorListXML = floorListTag.end({ pretty: true});
									fs.writeFile(buildingFolderPath + "/floorlist.xml", floorListXML.toString(), function(err) {
										
									    if(err) {
									    	
											log.error(err);
						        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
						        			});										    
									    	
									    } else {
									    	
									        log.info("floorlist.xml has been created or updated");
									        
									        // Construct index.xml
											var sailsBuildingTag = builder.create('sailsbuilding', {
													'location': '',
													'version': '1.0', 
													'encoding': 'UTF-8',
													'standalone': 'yes'
											}).ele('building', {
												'name': building.name ? building.name : '',
												'id': building.id
											}).ele('read', {
												'filepath' : 'floorlist.xml',
												'type' : 'floorlist'
											});
											var indexXML = sailsBuildingTag.end({ pretty: true});
											fs.writeFile(buildingFolderPath + "/index.xml", indexXML.toString(), function(err) {
												
												if(err) {
													
													log.error(err);
								        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								        			});										
													
												} else {
													
													log.info("index.xml has been created or updated");
				
													var locationMapzipPath = folderPath + "/" + building.id + ".zip",
											 			targetPath = building.userId + "/" + building.id + ".zip",
											 			output = fs.createWriteStream(locationMapzipPath),
											 			archive = archiver('zip');
												
													output.on('close', function() {
													  log.info('archiver finish package map.zip');
													});

													archive.on('error', function(err) {
													  throw err;
													});

													archive.pipe(output);
													
													// Start to package map.zip													
													fs.readdir(buildingFolderPath, function(err, files){
														
														if(err){
															
															log.error(err);
															
														}else{
															
															for(var i=0; i<files.length; i++){
																
																var filePath = buildingFolderPath + "/" + files[i];
																var isFolder = fs.statSync(filePath).isDirectory();
																
																console.log(filePath);
																console.log(isFolder);
																if(isFolder){
																		
																	(function(filePathF, layer){

																		fs.readdir(filePathF, function(err, filesI){
																			
																			if(err){
																				
																				log.error(err);
																				
																			}else{
																				
																				for(var j=0; j<filesI.length; j++){
																					
																					var filePathInner = filePathF + "/" + filesI[j];																		
																					archive.append(fs.createReadStream(filePathInner), { name: "/" + layer + "/" + filesI[j] });
																																										
																				}
																				
																			}
																																						
																		});																		
																		
																	}(filePath, files[i]));
																	
																}else{
																	archive.append(fs.createReadStream(filePath), { name: files[i] });																		
																}
																
																
															}
															
															archive.finalize(function(err, bytes) {
																  if (err)
																    throw err;

																  log.info(bytes + ' total bytes');
															});	
															
															
														}
																												
													});
													
													building.mapzip = targetPath;
													building.mapzipUpdateTime = new Date();				
													building.save(function(err, building){
														
														if(err)
															log.error(err);
														
														if(building)
															res.send(200, building);				
														
													});																										
													
												}
												
											});
											
									    }
									    
									});							
																
								}
														
							});					
												
						}					
						
					});
					
				}
				
			}
			
		});
		
	} else {
		
		res.json( errorResInfo.INCORRECT_PARAMS.code , { 
			msg: errorResInfo.INCORRECT_PARAMS.msg
		});			
		
	}
	
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
                "Content-disposition": "attachment; filename=map.zip",
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