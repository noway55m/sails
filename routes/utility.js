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
	config = require('../config/config.js');
	

/**
 * Utility function 
 */
function Utility(){}

// Error code and response error msg
Utility.errorResInfo = {
		
	ERROR_PERMISSION_DENY : {		
		msg: "You have no permission to access",
		code: 403		
	},
	
	INTERNAL_SERVER_ERROR : {
		msg: "You have no permission to access",
		code: 500				
	},
	
	INCORRECT_PARAMS : {
		msg: "Incorrect params",
		code: 400				
	}
	
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

module.exports = Utility;