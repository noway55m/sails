var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("../utility.js"),
    mkdirp = require("mkdirp"),
	User = require("../../model/user"),
    Building = require("../../model/building"),
    Floor = require("../../model/floor"),
    Store = require("../../model/store"),    
    Ad = require("../../model/ad"),
    Sdk = require("../../model/admin/sdk"),
    crypto = require('crypto'),
    AdmZip = require('adm-zip'),
    archiver = require('archiver'),
    rimraf = require('rimraf'),
    fs = require('fs'),
	path = require('path'),
	util = require('util'),
	config = require('../../config/config'),
	builder = require('xmlbuilder'),
	archiver = require('archiver');

// Static variable
var	errorResInfo = utilityS.errorResInfo,
	mapinfo_path = "/" + config.mapInfoPath,
	image_path = config.imagePath;

// GET Page for show sdk info
exports.sdkIndex = function(req, res) {

	res.render("admin-view/resource/sdkIndex.html", {
		osType: Sdk.OS_TYPE
	});

};

// GET Interface for list all sdks
exports.sdkList = function(req, res) {

	Sdk.find({}).sort({ version: 1 }).exec(function(err, sdks){

		if(err) {

            log.error(err);
			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
			});  	

		} else {

			var iosSdks = [],
				androidSdks = [];

			// Differentiate 'android' and 'ios'
			for( key in sdks ) {
				if( sdks[key].osType == Sdk.OS_TYPE.ANDROID ) {

					androidSdks.push(sdks[key]);

				} else {

					iosSdks.push(sdks[key]);

				}
			}
				
	        res.json(errorResInfo.SUCCESS.code, {

	        	iosSdks: iosSdks,
	        	androidSdks: androidSdks 

	        });  

		}

	});

};

// POST Interface for add new sdk
exports.sdkCreate = function(req, res){

	if( req.body.name && req.body.osType ) {

		Sdk.findOne({

			name: req.body.name

		}, function(err, sdk){

			if( err ) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if( !sdk ) {

					new Sdk({

						version: req.body.name,
						osType: req.body.osType,
						createdTime: new Date(),
						updatedTime: new Date()

					}).save(function(err, sdk){

						if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  

						} else {

							res.json( errorResInfo.SUCCESS.code, sdk);

						}

					});

				} else {

		            log.error(err);
					res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
						msg: "duplicate name"
					});  

				}

			}

		});

	} 

}

// POST Interface for update sdk
exports.sdkUpdate = function(req, res){

    if(req.body._id){
    	    	
        // Get building
        Sdk.findById(req.body._id, function(err, sdk){

            if(err){
            	
                log.error(err);
    			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
    				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
    			});            	            	
                                
            }else{

                if(sdk){
                	
                	// temp original file path and extension        	  
                	var originalSdkFilePath = sdk.sdkFilePath;
                	var originalSdkExtension = originalSdkFilePath ? originalSdkFilePath.substring(
                		originalSdkFilePath.lastIndexOf(".") + 1, originalSdkFilePath.length) : null;
                	var originalSampleCodeFilePath = sdk.sampleCodeFilePath;
                	var originalSampleCodeExtension = originalSampleCodeFilePath ? originalSampleCodeFilePath.substring(
                		originalSampleCodeFilePath.lastIndexOf(".") + 1, originalSampleCodeFilePath.length) : null;

                	console.log("originalSdkFilePath: " + originalSdkFilePath);
                	console.log("originalSdkExtension: " + originalSdkExtension);
                	console.log("originalSampleCodeFilePath: " + originalSampleCodeFilePath);
                	console.log("originalSampleCodeExtension: " + originalSampleCodeExtension);

                	// Get rename file name and path
					var osTypeFolder = sdk.osType == Sdk.OS_TYPE.ANDROID ? 'android' : 'ios';
						folderPath = path.dirname() + "/" + config.sailsResPath + '/' + osTypeFolder,								
						sdkFile = folderPath + "/" + originalSdkFilePath;
						sampleCodeFile = folderPath + "/" + originalSampleCodeFilePath,
						newSdkFileName = Sdk.getSdkFileName(req.body.version) + "." + originalSdkExtension,
						newSdkFile = folderPath + "/" + newSdkFileName,
						newSampleCodeFileName = Sdk.getSampleCodeFileName(req.body.version) + "." + originalSampleCodeExtension,						
						newSampleCodeFile = folderPath + "/" + newSampleCodeFileName;

                	console.log("newSdkFileName: " + newSdkFileName);
                	console.log("newSdkFile: " + newSdkFile);
                	console.log("newSampleCodeFileName: " + newSampleCodeFileName);
                	console.log("newSampleCodeFile: " + newSampleCodeFile);
						
                    sdk.version = req.body.version;
                    sdk.isCurrentVersion = req.body.isCurrentVersion;
                    if(originalSdkFilePath)
                    	sdk.sdkFilePath = newSdkFileName;
                    if(originalSampleCodeFilePath)
                    	sdk.sampleCodeFilePath = newSampleCodeFileName;                    
                    sdk.save(function(err, sdkS){
                        
                    	if( err ) {

                    		log.error(err);
		        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
		        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
		        			});                              		

                    	} else {

                    		// Change file name
                    		if(originalSdkFilePath) {
	                    		fs.rename( sdkFile, newSdkFile, function(err){
	                    			if(err)
	                    				log.error(err);
	                    		});
                    		}

                    		if(originalSampleCodeFilePath) {
	                    		fs.rename( sampleCodeFile, newSampleCodeFile, function(err){
	                    			if(err)
	                    				log.error(err);
	                    		});                    		
                    		}

		                    // Change other sdk isCurrentVersion to false
		                    if(req.body.isCurrentVersion){

		                    	Sdk.find({

		                    		isCurrentVersion: true,
		                    		osType: sdkS.osType

		                    	}, function(err, sdks){

		                    		if(err) {

		                    			log.error(err);

		                    		} else {

		                    			for( var i=0; i<sdks.length; i++){
		                    				if(sdks[i]._id.toString() != sdkS._id.toString()){

		                    					(function(sdkO){

		                    						sdkO.isCurrentVersion = false;
		                    						sdkO.save(function(err){

		                    							if(err)
		                    								log.error(err);

		                    						});

		                    					}(sdks[i]));

		                    				}
		                    			}

		                    		}

		                    	});

		                    }

							res.json( errorResInfo.SUCCESS.code, sdkS );

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

}

// POST Interface for delete sdk
exports.sdkDelete = function(req, res) {

	if(req.body._id){						

		// Find sdk
		Sdk.findById(req.body._id, function(err, sdk){
			
			if(err) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if(sdk){
						
					// Temp os type
					var os_type = sdk.osType;

					// Remove sdk
					sdk.remove(function(err){

						if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  

						} else {

							var osTypeFolder = sdk.osType == Sdk.OS_TYPE.ANDROID ? 'android' : 'ios';
								folderPath = path.dirname() + "/" + config.sailsResPath + '/' + osTypeFolder,								
								sdkFile = folderPath + "/" + sdk.sdkFilePath;
								sampleCodeFile = folderPath + "/" + sdk.sampleCodeFilePath;

							// Remove sdk file
							fs.unlink(sdkFile, function (err) {
								if (err)
									log.error(err);
							});								

							// Remove sample code
							fs.unlink(sampleCodeFile, function (err) {
								if (err)
									log.error(err);
							});

							res.send( errorResInfo.SUCCESS.code, {
								_id: req.body._id,
								osType: os_type
							});

						}
							
					});
										
				} else {

        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			}); 

				}

			}
			
		});
				
	}
	
};



// POST Interface for upload sdk and sample code
exports.uploadSdkAndSampleCode = function(req, res) {
};

// POST Interface for upload sdk
exports.uploadSdk = function(req, res) {

	if(req.body._id && req.files.sdk){

	    Sdk.findById(req.body._id, function(err, sdk) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(sdk){

			        // Get the temporary location of the file
			        var tmpPathPath = req.files.sdk.path;

			        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
					var fileName = req.files.sdk.name;			        
			        var extension = path.extname(fileName).toLowerCase();
			        var osFolder = sdk.osType == Sdk.OS_TYPE.ANDROID ? "android" : "ios";
			        var folderPath = path.dirname() + "/" + config.sailsResPath + '/' + osFolder;
			        var newFileName = Sdk.getSdkFileName(sdk.version) + extension;
	                var targetPathPath = folderPath + "/" + newFileName;
	                log.info("targetPathPath: " + targetPathPath);
	                	
	                fs.rename(tmpPathPath, targetPathPath, function(err) {

	                    if (err){

	                        log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	                    } else {

		                    // Update floor
		                    sdk.updatedTime = new Date();	
		                    sdk.sdkFilePath = newFileName;                                
		                    sdk.save(function(err, sdk) {

		                        if (err){

		                            log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});						                            
		                        
		                        } else {

			                        res.send( errorResInfo.SUCCESS.code, sdk );

		                        }		                          

		                        // Delete temped path.xml
		                        fs.unlink( tmpPathPath, function(err){} );

		                    });

	                    }	                   

	                });		            	    

	    		} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
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

// POST Interface for upload sample code
exports.uploadSampleCode = function(req, res) {

	if(req.body._id && req.files.sampleCode){

	    Sdk.findById(req.body._id, function(err, sdk) {

	    	if(err){

                log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				}); 

	    	} else {

	    		if(sdk){

			        // Get the temporary location of the file
			        var tmpPathPath = req.files.sampleCode.path;

			        // File path: /${USER._ID}/${BUILDING._ID}/${FLOOR._ID}
					var fileName = req.files.sampleCode.name;			        
			        var extension = path.extname(fileName).toLowerCase();
			        var osFolder = sdk.osType == Sdk.OS_TYPE.ANDROID ? "android" : "ios";
			        var folderPath = path.dirname() + "/" + config.sailsResPath + '/' + osFolder;
			        var newFileName = Sdk.getSampleCodeFileName(sdk.version)  + extension;
	                var targetPathPath = folderPath + "/" + newFileName;
	                log.info("targetPathPath: " + targetPathPath);
	                	
	                fs.rename(tmpPathPath, targetPathPath, function(err) {

	                    if (err){

	                        log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							}); 

	                    } else {

		                    // Update floor
		                    sdk.updatedTime = new Date();	
		                    sdk.sampleCodeFilePath = newFileName;                                
		                    sdk.save(function(err, sdk) {

		                        if (err){

		                            log.error(err);
									res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
										msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
									});						                            
		                        
		                        } else {

			                        res.send( errorResInfo.SUCCESS.code, sdk );

		                        }		                          

		                        // Delete temped path.xml
		                        fs.unlink( tmpPathPath, function(err){} );

		                    });

	                    }	                   

	                });		            	    

	    		} else {

					res.json( errorResInfo.INCORRECT_PARAMS.code , { 
						msg: errorResInfo.INCORRECT_PARAMS.msg
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
