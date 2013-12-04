var log = require('log4js').getLogger(), 
	fs = require('fs'),
	path = require('path'),
	User = require("../model/user"),
	Building = require("../model/building"),
	Floor = require("../model/floor"),
	Store = require("../model/store"),    
	Ad = require("../model/ad"),
	AccountActivateToken = require("../model/accountActivateToken"),	
	mailer = require('../config/nodemailerSetup'),
	mkdirp = require("mkdirp"),
	config = require('../config/config.js'),
	builder = require('xmlbuilder'),	
	archiver = require('archiver');


/**
 * Utility function 
 */
function Utility(){}

// Error code and response error msg
Utility.errorResInfo = {
		
	SUCCESS : {
		msg: {},
		code: 200					
	},	
				
	ERROR_PERMISSION_DENY : {		
		msg: "You have no permission to access",
		code: 403		
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

	EMPTY_RESULT : {
		msg: "empty result",
		code: 204				
	},

	
};

// Check the permission about specific model relative to specific user
Utility.validatePermission = function(user, obj, type, next){
	
	switch(type){
		
		// Building Model
		case Building.modelName:
			
			var result = false;
			if( (obj && obj.userId == user.id) || user.role == User.ROLES.ADMIN){				
				result = true;								
			}else{
				result = false;
			}
			next(result);
			break;
		
		// Floor Model	
		case Floor.modelName:
			
			var result = false;			
			if(user.role == User.ROLES.ADMIN){				
				result = true;
				next(result);				
			}else{				
				var buildingId = obj.buildingId;
				Building.findById(buildingId, function(err, building){					
					if(err){
						log.error(err);					
					}else{
						if(building && building.id == user.id)
							result = true;
					}
					next(result);					
				});								
			}
			break;
		
		// Store Model	
		case Store.modelName:
			break;
		
		// Ad Model	
		case Ad.modelName:
			break;
			
		default:
			break;
			
	}
	
};

// Function for create sample building
Utility.createSampleBuilding = function(nuser, next){
	
	// Start to create default building after response
    new Building({

        name: "Sample",
        desc: "You can customize your builiding by this sample",
        userId: nuser.id,
        pub: false,
        icon: "building-sample-icon.png",
        address: "Building address"
        	
    }).save(function(err, building){
    	
    	if(err){
    		
    		log.error(err);
    		
    	}else{
    	
            if(building){
						            	
				// Main Folder path
				var folderPath = path.dirname() + "/" + config.mapInfoPath + "/" + nuser.id,
					buildingFolderPath = folderPath + "/" + building.id,
					floorFolderPath = buildingFolderPath + "/1",
					clientImagePath = folderPath + "/client-image",
					samplePath = config.sampleBuildingPath + "/1";   
	 								
				// Make sure building folder path exist, if not created
				mkdirp(floorFolderPath, function(err, dd) {
					
					if(err){
						
						log.error(err);
						
					}else{
						
						// Make sure client-image folder path exist, if not created (TODO: for put user's images for future)
						mkdirp(clientImagePath, function(err, dd) {
							
							if(err){
								
								log.error(err);
								
							}else{
								
								// Get sample folder data
								fs.readdir(samplePath, function(err, files){
									
									if(err){
										
										log.error(err);
										
									}else{
										
										
										// Copy the default xml files and zip to floor folder of default building of user
										for(var i=0; i<files.length; i++){
											console.log(samplePath + "/" + files[i]);
											fs.createReadStream( samplePath + "/" + files[i], {																
												encoding: 'utf8',
												autoClose: true																
											}).pipe(fs.createWriteStream(floorFolderPath + "/" + files[i]));																					
										}																		
										
										// Create new floor
										new Floor({
											
											layer: 1,													
											buildingId: building.id,
											map: floorFolderPath + '/map.xml',
											path: floorFolderPath + '/path.xml'
						
										}).save(function(err, floor){																																											
											if(err)
												log.error(err);
											
											if(next)
												next();
										});	
																											
									}
																																																				
								});																								
																																						
							}
							
						});
						
					}
				
				});							            	
            									            								            	
            }// end if						        								        		
    		
    	}						        	

    });		
		
};


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
				
			}
			
		});

}

module.exports = Utility;