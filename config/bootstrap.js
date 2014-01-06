var crypto = require('crypto'), 
	log = require('log4js').getLogger(),
    fs = require('fs'),	
	path = require('path'),
	mkdirp = require("mkdirp"),	
	archiver = require('archiver'),
	zlib = require('zlib'),
	unzip = require('unzip'),
	User = require('../model/user'),
	Store = require('../model/store'),	
	Floor = require('../model/floor'),
	Building = require('../model/building'),
	Sdk = require('../model/admin/sdk'),
	utilityS = require("../routes/utility.js"),
	config = require('../config/config');

module.exports = function() {

	// Create default administrator
	createDefaultUser();

	// Create default sdk and sample code
	createDefaultSdkAndSampleCode();

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

					log.info("Sample building exist already");

					// Load to application info
					utilityS.applicationInfo.sampleBuildingId = building._id;

				} else {

					createSampleBuilding(user);

				}

			});

		} else {

			new User({

				username : "admin",
				password : User.encodePassword("Admin123"),
				role: 1,
				enabled: true,
				token: User.genToken()
				
			}).save(function(err, user){

				if(err)
					log.error(err);

				if(user){
					log.info('Default user has been generated successfully');
					createSampleBuilding(user);				
				}

			});

		}

	});

}

// Function for create sample building
function createSampleBuilding(user){

	var sampleFolderName = config.sampleBuildingPath;
	sampleFolderName = sampleFolderName.substring(sampleFolderName.lastIndexOf('/')+1, sampleFolderName.length);
	var sampleBuildingPath = path.dirname() + "/" + config.sampleBuildingPath; 
	new Building({

		name: "MyHome",						
		desc: "This is sample project",
		downfloor: 0,
		upfloor: 1,
		pub: true,
		userId: user._id,
		createdTime: new Date()					

	}).save(function(err, building){

		if(err)
			log.err(err);

		if(building){

			// Load to application info
			utilityS.applicationInfo.sampleBuildingId = building._id;

			var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + user.id,
				buildingFolderPath = folderPath + "/" + building.id,
				buildingWebLocation = user.id + "/" + building.id,
				clientImagePath = folderPath + "/client-image",
				sampleBuildingPath = path.dirname() + "/" + config.sampleBuildingPath;

			// Make sure building folder path exist, if not created
			mkdirp(buildingFolderPath, function(err, dd) {
				
				if(err){
					
					log.error(err);buildingFolderPath
					
				}else{
					
					// Make sure client-image folder path exist, if not created (TODO: for put user's images for future)
					mkdirp(clientImagePath, function(err, dd) {
						
						if(err){
							
							log.error(err);
							
						}else{
							
							// Copy sample building mapzip
							fs.readdir(sampleBuildingPath, function(err, files){

								if(err){

									log.error(err);

								} else {

									// Copy the default xml files and zip to floor folder of default building of user
									for(var i=0; i<files.length; i++){

										var filePath = sampleBuildingPath + "/" + files[i],
											stat = fs.statSync(filePath);
										if(stat.isDirectory()){

											// Get sample folder data
											(function(theLayer){

												var floorFolderPath = buildingFolderPath + "/" + theLayer,
													floorWebLocation = buildingWebLocation + "/" + theLayer,
													floors = [];

												// Make folder of building and floor exist	
												mkdirp(floorFolderPath, function(err, dd) {

													if(err)
														log.error(err);

													fs.readdir( sampleBuildingPath + "/" + theLayer, function(err, files2){
														
														if(err){
															
															log.error(err);
															
														}else{
																							
															var archive2 = archiver('zip'),
																output2 = fs.createWriteStream( floorFolderPath + '/map.zip');

															output2.on('close', function() {
															  log.info('archiver finish package map.zip');
															});

															archive2.on('error', function(err) {
															  if(err)
															  	log.error(err);
															});

															archive2.pipe(output2);

															var tempFiles = [];

															// Copy the default xml files and zip to floor folder of default building of user
															for(var j=0; j<files2.length; j++){

																log.info(files2[j]);																

																if( files2[j].indexOf("map.zip") != -1) {

																	var rss = fs.createReadStream(sampleBuildingPath + "/" + theLayer + "/" + files2[j]);

																	// Unzip first and write to temp files
																	rss.pipe(unzip.Parse())
																	  .on('entry', function (entry) {
																	    var fileName = entry.path;
																		var ws = fs.createWriteStream(floorFolderPath + "/temp-" + fileName);
																		entry.pipe(ws);
																		tempFiles.push("temp-" + fileName);
																	});

																	rss.on('end', function(){

																		// Package map.zip of floor to user's building folder
																		for(var g=0; g<tempFiles.length; g++)
																			archive2.append(fs.createReadStream(floorFolderPath + "/" + tempFiles[g]), 
																				{ name: tempFiles[g].replace("temp-", "") });
																		
																		archive2.finalize(function(err, bytes) {																			
																			if (err)
																				log.error(err);

																			log.info(bytes + ' total bytes');

																		});		

																	})

																} else if( files2[j].indexOf("temp") != -1 ){ 

																	// Ignore tmep files
																	log.info("temp file");

																} else {

																	fs.createReadStream( sampleBuildingPath + "/" + theLayer + "/" + files2[j], {																
																		encoding: 'utf8',
																		autoClose: true																
																	} ).pipe( fs.createWriteStream( floorFolderPath + "/" + files2[j] ) );

																}

															}																															
															
															// Find sample floor
															new Floor({
																
																name: "Sample",
																desc: "This is a sample floor",																					
																layer: theLayer,													
																map: floorWebLocation + '/map.xml',
																path: floorWebLocation + '/path.xml',
																render: floorWebLocation + '/render.xml',
																region: floorWebLocation + '/region.xml',
																mapzip: floorWebLocation + '/map.zip',																			
																buildingId: building.id,
											
															}).save(function(err, floor){

																if(err)
																	log.error(err);
																
																if(floor){

																	floors.push(floor);

																	var regionXmlPath = sampleBuildingPath + "/" + theLayer + "/region.xml";

												                    // Start to parse region.xml for create default stores
												                    fs.readFile(regionXmlPath, 'utf8', function (err, data) {

												                        if(err)
												                          log.error(err);

												                        if(data)
												                            utilityS.parseRegion(data, floor._id);

												                    });

																	// Generate index.xml and floorlist.xml
																	var limit = building.downfloor > building.upfloor ? -(building.downfloor) : building.upfloor;
																	log.info("limit: " + limit);
																	if( theLayer == limit ){

																		utilityS.genIndexXmlOfBuilding(building, function(err){

																			if(err){
 

																				log.error(err);

																			} else {

																				utilityS.genFloorlistXmlOfBuilding(building, floors, function(err){

																					if(err){

																						log.error(err);

																					} else {

																						var archive = archiver('zip'),
																							output = fs.createWriteStream( folderPath + "/" + building.id +'.zip');													
		
																						output.on('close', function() {
																						  log.info('archiver finish package map.zip');
																						});

																						archive.on('error', function(err) {
																						  if(err)
																						  	log.error(err);
																						});

																						archive.pipe(output);

																						// Start to package map.zip													
																						fs.readdir(buildingFolderPath, function(err, files3){
																							
																							if(err){
																								
																								log.error(err);
																								
																							}else{
																								
																								for(var n=0; n<files3.length; n++){
																									
																									var filePath = buildingFolderPath + "/" + files3[n];
																									var isFolder = fs.statSync(filePath).isDirectory();
																									
																									if(isFolder){
																											
																										(function(filePathF, layer){

																											log.info(filePathF);
																											fs.readdir(filePathF, function(err, filesI){
																												
																												if(err){
																													
																													log.error(err);
																													
																												}else{
																													
																													for(var m=0; m<filesI.length; m++){
																														
																														if(filesI[m].indexOf("index.xml") != -1 || filesI[m].indexOf("aplist.xml") != -1)
																															continue;
																														var filePathInner = filePathF + "/" + filesI[m];
																														console.log(filePathInner);																		
																														archive.append(fs.createReadStream(filePathInner), { name: "/" + layer + "/" + filesI[m] });
																																																			
																													}
																													
																												}
																																															
																											});																		
																											
																										}(filePath, files3[n]));
																										
																									}else{

																										console.log(filePath);
																										archive.append(fs.createReadStream(filePath), { name: files3[n] });

																									}
																																									
																								}

																								archive.finalize(function(err, bytes) {
																									
																									if (err)
																										log.error(err);

																									  log.info(bytes + ' total bytes');

																									 building.mapzip =  buildingWebLocation + "/map.zip";
																									 building.save(function(err, building){
																									 	if(err)
																									 		log.error(err);
																									 });

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
																																
														}
																																																									
													});	

												});


											}( files[i] ) )

										}

									}		

								}

							});																						
																																					
						}
						
					});
					
				}
			
			});	
				
		}

		log.info('Sample building has been generated successfully');

	});

}

// Function for create default sdk and sample code
function createDefaultSdkAndSampleCode(){

	Sdk.find({

		isCurrentVersion : true

	}, function(err, sdks) {

		if (err)
			log.error(err);

		if (sdks.length > 0) {

			log.info("Default sdk exist already");

		} else {

			var androidVersion = config.defaultAndroidSdkVersion;
			var iosVersion = config.defaultIosSdkVersion;
			new Sdk({

				version: androidVersion,
				osType: Sdk.OS_TYPE.ANDROID,
				isCurrentVersion: true,
				sdkFilePath: Sdk.getSdkFileName(androidVersion) + ".jar",
				sampleCodeFilePath: Sdk.getSampleCodeFileName(androidVersion) + ".rar"

			}).save(function( err, sdk ){

				if(err){

					log.error(err);

				} else {

					log.info("Create default android sdk successfully");

				}

			});

			new Sdk({

				version: iosVersion,
				osType: Sdk.OS_TYPE.IOS,
				isCurrentVersion: true

			}).save(function( err, sdk ){

				if(err){

					log.error(err);

				} else {

					log.info("Create default ios sdk successfully");

				}
				
			});


		}

	});

}