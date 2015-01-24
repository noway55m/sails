var log = require('log4js').getLogger(), 
	fs = require('fs'),
	zlib = require('zlib'),
	unzip = require('unzip'),	
	path = require('path'),	
	User = require("../model/user"),
	Poi = require("../model/poi"),
	PoiEvent = require("../model/poiEvent"),	
	Building = require("../model/building"),
	Floor = require("../model/floor"),
	Store = require("../model/store"),    
	Ad = require("../model/ad"),
	iBeaconDevice = require("../model/iBeaconDevice"),
	Geofence = require("../model/geofence"),	
	AccountActivateToken = require("../model/accountActivateToken"),	
	mailer = require('../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../config/config.js'),
	builder = require('xmlbuilder'),	
	archiver = require('archiver'),
	parseString = require('xml2js').parseString;


/**
 * Utility function 
 */
function Utility(){}

Utility.applicationInfo = {
	sampleBuildingId : ""
}

// Error code and response error msg
Utility.errorResInfo = {
		
	SUCCESS : {
		msg: {},
		code: 200					
	},

	PARTIAL_DOWNLOAD_SUCCESS : {
		msg: {},
		code: 206					
	},
				
	ERROR_PERMISSION_DENY : {		
		msg: "You have no permission to access",
		code: 403		
	},

	BUILDING_OVER_LIMITATION_DENY : {		
		msg: "Building number is over limitation.",
		code: 403		
	},

	FLOOR_OVER_LIMITATION_DENY : {		
		msg: "Floor number is over limitation.",
		code: 403		
	},

	BASEMENT_OVER_LIMITATION_DENY : {		
		msg: "Basement number is over limitation.",
		code: 403		
	},

	NOT_FOUND : {		
		msg: "can not find this url.",
		code: 404		
	},						
	
	INTERNAL_SERVER_ERROR : {
		msg: "Internal server error, please try again later",
		code: 500				
	},
	
	INCORRECT_PARAMS : {
		msg: "Incorrect params",
		code: 400				
	},
	
	INCORRECT_FILE_TYPE : {
		msg: "Incorrect file type",
		code: 400				
	},

	FILE_NOT_EXIST : {
		msg: "File not exist",
		code: 400				
	},

	OVER_UPLOAD_MAXIMUM_SIZE : {
		msg: "Over maximum upload size",
		code: 400				
	},

	EMPTY_RESULT : {
		msg: "empty result",
		code: 204				
	},

	
};

// Check the permission about specific model relative to specific user
Utility.validatePermission = function(user, obj, type, next, isRead){
	
	switch(type){
		
		// Building Model
		case Building.modelName:
			
			var result = false;
			if ( isRead && obj.pub ) {

				result = true;

			} else if ( (obj && obj.userId == user.id.toString()) || user.role == User.ROLES.ADMIN) {

				result = true;

			} else {

				result = false;

			}			
			next(result);
			break;

		// Poi model	
		case Poi.modelName:

			var result = false;			
			if(user.role == User.ROLES.ADMIN) {

				result = true;
				next(result);

			} else {

				Building.findById( obj.buildingId, function(err, building) {

					if(err) {

						log.error(err);					
					
					} else {

						if( building && building.userId == user.id.toString() )
							result = true;

						if( building && isRead && building.pub )
							result = true;

					}
					next(result);

				});

			}
			break;
		
		// PoiEvent model	
		case PoiEvent.modelName: 

			var result = false;			
			if(user.role == User.ROLES.ADMIN) {

				result = true;
				next(result);

			} else {

				Poi.findById( obj.poiId, function(err, poi) {

					if(err) {

						log.error(err);

					} else {

						Building.findById( poi.buildingId, function(err, building) {

							if(err) {

								log.error(err);					
							
							} else {

								if( building && building.userId == user.id.toString() )
									result = true;

								if( building && isRead && building.pub )
									result = true;

							}
							next(result);

						});

					}

				})

			}
			break;

		// Floor Model	
		case Floor.modelName:
			
			var result = false;			
			if(user.role == User.ROLES.ADMIN) {

				result = true;
				next(result);

			} else {

				Building.findById( obj.buildingId, function(err, building) {

					if(err) {

						log.error(err);					
					
					} else {

						if( building && building.userId == user.id.toString() )
							result = true;

						if( building && isRead && building.pub )
							result = true;

					}
					next(result);

				});

			}
			break;
		
		// iBeaconDevice Model
		case iBeaconDevice.modelName:	

		// Geofence Model
		case Geofence.modelName:	

		// Store Model	
		case Store.modelName:

			var result = false;			
			if(user.role == User.ROLES.ADMIN) {

				result = true;
				next(result);

			} else {

				Floor.findById( obj.floorId, function(err, floor) {

					if(err) {

						log.error(err);
						next(result);					
					
					} else {

						if(floor) {

							Building.findById( floor.buildingId, function(err, building) {

								if(err) {

									log.error(err);
									
								} else {

									if( building && building.userId == user.id.toString() )
										result = true;

									if( building && isRead && building.pub )
										result = true;									

								}

								next(result);

							});

						} else {

							next(result);

						}
							

					}

				});

			}	

			break;
		
		// Ad Model	
		case Ad.modelName:

			var result = false;			
			if(user.role == User.ROLES.ADMIN) {

				result = true;
				next(result);

			} else {

				Store.findById( obj.storeId, function(err, store) {

					if(err) {

						next(result);

					} else {

						if(store) {

							Floor.findById( store.floorId, function(err, floor) {

								if(err) {

									next(result);

								} else {

									if(floor) {

										Building.findById( floor.buildingId, function(err, building) {

											if(err) {

												log.error(err);					
											
											} else {

												if( building && building.userId == user.id.toString() )
													result = true;

												if( building && isRead && building.pub )
													result = true;												

											}
											next(result);																					

										});

									} else {

										next(result);

									}

								}

							});

						} else {

							next(result);

						}

					}

				});

			}		
			break;
			
		default:
			break;
			
	}
	
};


// Function for map info resource folder
Utility.createMapinfoResourceFolder = function(nuser, next) {

	var resourceFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + nuser.id + "/resource";
	mkdirp(resourceFolderPath, function(err) {

		if(err)
			log.error(err)

		if(typeof next == "function")
			next(err);

	});

}


// Function for create sample building
Utility.createSampleBuilding = function(nuser, next){
	
	log.info('sampleBuildingId: ' + Utility.applicationInfo.sampleBuildingId);
	Building.findById(Utility.applicationInfo.sampleBuildingId, function(err, sampleBuilding){

		if(err) {

			log.error("Utility.createSampleBuilding ~ Find sample building error")
			log.error(err);

		} else {

			if(!sampleBuilding) {

				log.error("Utility.createSampleBuilding ~ Can't Find sample building")

			} else {

				// Start to create sample building
				log.info("Start to generate sample building for user: " + nuser._id);
			    new Building({

			        name: sampleBuilding.name,
			        desc: sampleBuilding.desc,
					downfloor: sampleBuilding.downfloor,
					upfloor: sampleBuilding.upfloor,		        
			        userId: nuser.id,
			        pub: sampleBuilding.pub,
			        createdTime: new Date()
			        	
			    }).save(function(err, building){
			    	
			    	if(err)	{

			    		log.error("Crearte sample building error for user" + nuser._id);	    		
			    		log.error(err);
			    		
			    	} else {
			    	
			            if(building){

							// Main Folder path
							var mainPath = nuser.id,
								folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + mainPath,
								buildingFolderPath = folderPath + "/" + building.id,
								buildingWebLocation = mainPath + "/" + building.id,
								sampleBuildingPath = path.dirname() + "/" + config.mapInfoPath + "/" + sampleBuilding.userId + "/" + sampleBuilding.id;   

							log.info("start to generate sample building folder: " + buildingFolderPath);
				 								
							// Make sure building folder path exist, if not created
							mkdirp(buildingFolderPath, function(err, dd) {
								
								if(err){
									
									log.error("Create sample building folder error for user" + nuser._id);
									log.error(err);
									
								}else{
																			
									// Copy sample building mapzip
									fs.readdir(sampleBuildingPath, function(err, files){

										if(err){

											log.error("Read sample building folder error");
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

														// Make sure building and floor folder of user exist	
														mkdirp(floorFolderPath, function(err, dd) {

															if(err)
																log.error(err);

															fs.readdir( sampleBuildingPath + "/" + theLayer, function(err, files2){
																
																if(err){
																	
																	log.error(err);
																	
																}else{																						

																	var archiveM = archiver('zip'),																			
																		outputM = fs.createWriteStream( floorFolderPath + "/map.zip");													

																	outputM.on('close', function() {
																	  log.info('archiver finish package map.zip');
																	});

																	archiveM.on('error', function(err) {
																	  if(err)
																	  	log.error(err);
																	});

																	archiveM.pipe(outputM);

																	var tempFiles = [];
																																								
																	// Copy the default xml files and zip to floor folder of default building of user																		
																	for(var j=0; j<files2.length; j++){

																		if( files2[j].indexOf("map.zip") != -1){

																			// Copy the files in map.zip
																			var rss = fs.createReadStream(sampleBuildingPath + "/" + theLayer + "/" + files2[j]);
																			rss.pipe(unzip.Parse()).on('entry', function (entry) {
																			    var fileName = entry.path;
																					var ws = fs.createWriteStream(floorFolderPath + "/temp-" + fileName);
																					entry.pipe(ws);
																					console.log("999999999999999999999999");																					
																					console.log(fileName);
																					console.log("999999999999999999999999");																					
																					tempFiles.push("temp-" + fileName);
																			});

																			// Package temp fileds to map.zip 
																			rss.on('end', function(){
																				console.log(tempFiles);
																				for(var g=0; g<tempFiles.length; g++)
																					archiveM.append(fs.createReadStream(floorFolderPath + "/" + tempFiles[g]), 
																						{ name: tempFiles[g].replace("temp-", "") });

																				archiveM.finalize(function(err, bytes) {																			
																					if (err)
																						log.error(err);
																					log.info(bytes + ' total bytes');
																				});	
																			})

																		} else {

																			fs.createReadStream( sampleBuildingPath + "/" + theLayer + "/" + files2[j], {																
																				encoding: 'utf8',
																				autoClose: true																
																			} ).pipe( fs.createWriteStream( floorFolderPath + "/" + files2[j] ) );	

																		}
																			
																	}																	
																	
																	// Find sample floor
																	Floor.findOne({

																		buildingId: sampleBuilding._id,
																		layer: theLayer

																	}, function(err, sampleFloor){

																		if(err)
																			log.err(err);

																		if(sampleFloor){

																			// Create new floor
																			new Floor({
																				
																				name: sampleFloor.name,
																				desc: sampleFloor.desc,																					
																				layer: sampleFloor.layer,													
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

																					// Start to create index.xml and floorlist.xml
																					var limit = Math.abs(building.downfloor) > building.upfloor ? building.downfloor : building.upfloor;
																					log.info("limit: " + limit);
																					log.info("theLayer: " + theLayer);
																					if(theLayer == limit){

																						Utility.genIndexXmlOfBuilding(building, function(err){

																							if(err){

																								log.error(err);

																							} else {

																								Utility.genFloorlistXmlOfBuilding(building, floors, function(err){

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
																														
																													} else if( files3[n].indexOf("temp") != -1 ){ 

																														log.info("temp file");

																													} else {

																														console.log(filePath);
																														archive.append(fs.createReadStream(filePath), { name: files3[n].replace("temp-", "") });

																													}
																																													
																												}

																												archive.finalize(function(err, bytes) {
																													
																													if (err)
																														log.error(err);

																													  log.info(bytes + ' total bytes');

																													if(next)
																														next();

																													 building.mapzip =  buildingWebLocation + ".zip";
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
																																		
																}
																																																											
															});	

														});


													}( files[i] ) )

												}

											}		

											// Create sample poi


										}

									});																						
									
								}
							
							});							            	
			            									            								            	
			            }// end if						        								        		
			    		
			    	}						        	

			    });	

			}

		}

	});
		
};


// Function for create sample poi
Utility.createSamplePoi = function(nuser, building, sampleBuilding, next) {

	// Start to create default building after response
	Poi.findOne({

		name: "MyPOI",
		buildingId: sampleBuilding._id 

	}, function(err, samplePoi){

		if(err)
			log.error(err);

		if(samplePoi) {

			log.info("Start to generate sample poi for user: " + nuser._id);		    
			new Poi({

			    name: samplePoi.name, 
			    customFields: samplePoi.customFields,
			    tags: samplePoi.tags,
				buildingId: building.id,
			    userId: nuser.id,
				createdTime: new Date(),
				updatedTime: new Date()

			}).save(function(err, poi){

				if(err)
					log.error(err);

				if(poi) {

					var mainPath = nuser.id + "/" + building.id,
						folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + mainPath,
						poiFolderPath = folderPath + "/" + poi.id,
						poiWebLocation = mainPath + "/" + poi.id,
						samplePoiPath = path.dirname() + "/" + config.mapInfoPath + "/" + sampleBuilding.userId +
						"/" + sampleBuilding.id + "/" + samplePoi.id; 

					// Make sure poi folder path exist, if not created
					mkdirp(poiFolderPath, function(err, dd) {
						
						if(err){
							
							log.error(err);
							
						}else{

						}

					});

				}

			});

		}

	});

}


// Function for package mapzip of specific building
Utility.packageMapzip = function(buildingId, next){

		var bid = buildingId,
			errorResInfo = Utility.errorResInfo,
			errorOjb = {};
		Building.findById(bid, function(err, building){
		
			if(err){
				
				log.error(err);
				errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
				errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
    			next(errorOjb);			 
				
			} else {
	
				if(building){
					
					// Get all floors and sort ascend
					Floor.find({
						
						buildingId: building.id
						
					}).sort({layer: 1}).execFind( function(err, floors){
						
						if(err){
							
							log.error(err);
							errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
							errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
			    			next(errorOjb);			 
							
						}else{
							
							// Main Folder path
							var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId,
								buildingFolderPath = folderPath + "/" + building.id;   
				 								
							// Make sure folder path exist, if not created
							mkdirp(buildingFolderPath, function(err, dd) {
								
								if(err){
									
									log.error(err);
									errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
									errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
					    			next(errorOjb);			 
									
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
											errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
											errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
							    			next(errorOjb);			 
									    	
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
													errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
													errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
									    			next(errorOjb);			 
													
												} else {
													
													log.info("index.xml has been created or updated");
				
													// Construct poi.json
													Utility.poiJSONInfo(building, function(err, obj){

														if(err) {

															log.error(err);

														} else {

															var poiTargetPath = buildingFolderPath + "/poi.json";
															fs.writeFile(poiTargetPath, JSON.stringify(obj), function(err) {
																
																if(err) {

																	log.error(err)

																} else {

																	log.info("poi.json has been created or updated");

																	var locationMapzipPath = folderPath + "/" + building.id + ".zip",
															 			targetPath = building.userId + "/" + building.id + ".zip",
															 			output = fs.createWriteStream(locationMapzipPath),
															 			archive = archiver('zip');
																
																	output.on('close', function() {
																	  log.info('archiver finish package map.zip');
																	});

																	archive.on('error', function(err) {
																	  if(err)
																	  	log.error(err);
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
																				
																				log.info(filePath);
																				log.info(isFolder);
																				if(isFolder){
																						
																					(function(filePathF, layer){

																						fs.readdir(filePathF, function(err, filesI){
																							
																							if(err){
																								
																								log.error(err);
																								
																							}else{
																								
																								for(var j=0; j<filesI.length; j++){
																									
																									var filePathInner = filePathF + "/" + filesI[j];
																									if( filesI[j].indexOf("temp") != -1 )
																										continue;
																									else																		
																										archive.append(fs.createReadStream(filePathInner), { name: "/" + layer + "/" + filesI[j] });
																																														
																								}

																								// if(filesI.length == 0)
																								//	archive.append(fs.createReadStream(filePath), { name: "/" + layer + "/.tmp" });
																								
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
																		
																		if(err){
																			log.error(err);
																			errorOjb.code = errorResInfo.INTERNAL_SERVER_ERROR.code;
																			errorOjb.msg = errorResInfo.INTERNAL_SERVER_ERROR.msg;
															    			next(errorOjb);																
																		}

																		if(building){
																			errorOjb.code = errorResInfo.SUCCESS.code;
																			errorOjb.building = building;
																			next(errorOjb);				
																		}

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
														
							});					
												
						}					
						
					});
					
				} else {

					errorOjb.code = errorResInfo.INCORRECT_PARAMS.code;
					errorOjb.msg = errorResInfo.INCORRECT_PARAMS.msg;
	    			next(errorOjb);			 

				}
				
			}
			
		});

}


// Function for parse regions and create stores on the floor
Utility.parseRegion = function(regionXMLString, floorId, next){
	
	parseString(regionXMLString, function (err, result) {
		
	    var ways = result.osm.way,
	    	storeNamesTemp = [];
	    Store.find({
	    	
	    	floorId : floorId
	    	
	    }, function(err, stores){

	    	if(err)
	    		log.error(err);
	    	
	    	if(ways){
	    			
	    		// Create stores in region.xml
	    		for(var i=0; i<ways.length; i++){

	    			var way = ways[i],
			    		tags = way.tag;

			    	for(var j=0; j<tags.length; j++){

		    			var tag = tags[j],
			    			tagInfo = tag.$;
			    		if(tagInfo.k == "label"){
	
			    			var name = tagInfo.v,
			    				isDuplicate = false;
			    			storeNamesTemp.push(name);
	
			    			// Check is duplicate
			    			for(var k=0; k< stores.length; k++){
			    				if(name == stores[k].name){
			    					isDuplicate = true;
			    					break;
			    				}
			    			}
	
			    			if(!isDuplicate){
								
		    					Store.create({
	
		    						name: tagInfo.v,
		    						floorId: floorId
	
		    					}, function(error, store){
		    						if(error)
		    							log.error(error);
	
		    						if(store)
		    							log.info("Create new store " + name + " successfully");
		    					});
	
			    			}else{
	
			    				log.info("Duplicate store name " + name);
	
			    			}
	
			    		}		    			

			    	}

	    		}

	    		// Delete the stores not in region.xml
	    		for(var i=0; i<stores.length; i++){	    		
		    		
	    			var isFound = false;
		    		for(var j=0; j<storeNamesTemp.length; j++){
		    			if(stores[i].name == storeNamesTemp[j]){
		    				isFound = true;
		    			}
		    		}

		    		if(!isFound){
		    			stores[i].remove(function(err){
		    				if(err)
		    					log.error(err);
		    			});
		    		}

	    		}
	    	}
	    	
	    });


	});

}


// Function for generate index.xml of building
Utility.genIndexXmlOfBuilding = function(building, next){

	var buildingFolderPath = path.dirname() + "/" + config.mapInfoPath  + "/" + building.userId + "/" + building.id,
		errorOjb = null;

	log.info("genIndexXmlOfBuilding ~ buildingFolderPath: " + buildingFolderPath);	

	// Make sure buidling folder path exist already	
	mkdirp(buildingFolderPath, function(err, dd) {
		
		if(err){
			
			log.error(err);
			errorOjb = {
				code: errorResInfo.INTERNAL_SERVER_ERROR.code,
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg	
			};
			next(errorOjb);			 
			
		}else{

			// Generate index.xml document
			var	sailsBuildingTag = builder.create('sailsbuilding', {

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

				}),
				indexXML = sailsBuildingTag.end({ pretty: true});

			// Write to file	
			fs.writeFile(buildingFolderPath + "/index.xml", indexXML.toString(), function(err) {

				if(err){

					log.error(err);
					errorOjb = {
						code: errorResInfo.INTERNAL_SERVER_ERROR.code,
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg	
					};
				
				}

				//if(typeof next == "function")
				log.info(next)
				next(errorOjb);			  

			});

		}

	});

}

// Function for generate floorlist.xml of building
Utility.genFloorlistXmlOfBuilding = function(building, floors, next){

	var buildingFolderPath = path.dirname() + "/" + config.mapInfoPath + "/" + building.userId + "/" + building.id,
		errorOjb = null;
		
	// Make sure buidling folder path exist already	
	mkdirp(buildingFolderPath, function(err, dd) {

		if(err){
			
			log.error(err);
			errorOjb = {
				code: errorResInfo.INTERNAL_SERVER_ERROR.code,
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg	
			};
			next(errorOjb);			 
			
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
					errorOjb = {
						code: errorResInfo.INTERNAL_SERVER_ERROR.code,
						msg: errorResInfo.INTERNAL_SERVER_ERROR.msg	
					};

				}
				next(errorOjb);

			});		

		}

	});

}


// Function for package mapzip by Achiver(real part of package map.zip by achiver)
Utility.packiageMapzipAchiver = function(building, isAdminSample, next){

	var archive = archiver('zip'),
		folderPath =  isAdminSample ? path.dirname() + "/" + config.sampleBuildingPath : path.dirname() + "/" + config.mapInfoPath + "/" + nuser.id,
		buildingFolderPath = isAdminSample ? folderPath : folderPath + "/" + building.id,
		outPutPath = "",
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

				if(next)
					next();

			});	
																		
		}
																
	});

}

// Function for construct poi json file
Utility.poiJSONInfo = function(building, next) {

	var poisObj = {
		pois: []
	}

	// Get all pois of specific building
	Poi.find({

		buildingId: building.id
	
	}, function(err, pois) {

		if(err) {

			log.error(err);
			next(err, poisObj);

		} else {

			poisObj.pois = pois;
			next(null, poisObj);

		}

	});

}

module.exports = Utility;