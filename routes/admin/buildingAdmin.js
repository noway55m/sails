var log = require('log4js').getLogger(),
	http = require('http'),
    utilityS = require("../utility.js"),
    mkdirp = require("mkdirp"),
	User = require("../../model/user"),
    Building = require("../../model/building"),
    Floor = require("../../model/floor"),
    Store = require("../../model/store"),    
    Ad = require("../../model/ad"),    
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

// GET Page for show specific building
exports.show = function(req, res) {
	res.render("admin-view/building/building-show.html");
};

// GET Interface of list buildings or buildings of specific user (new support pagination)
exports.list = function(req, res) {
	res.render("admin-view/building/building-list.html");	
};

// POST Interface of create new building
exports.create = function(req, res) {

    if(req.body.name){


    	Building.count({

    		userId: req.user._id

    	}, function( err, count ) {

	        if(err){

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  		

			} else {

				if(count <= config.maxBuildingNumberOfUser || user.role == User.ROLES.ADMIN ){

			        new Building({

			            name: req.body.name,
			            desc: req.body.desc,
			            userId: req.user._id,
			            pub: false,
			            createdTime: new Date()

			        }).save(function(err, building){

			        	if(err) {

				            log.error(err);
							res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
								msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
							});  

			        	} else {

				            if(building){

				                res.send( errorResInfo.SUCCESS.code, building );

				            }else{

					            log.error(err);
								res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
									msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
								});  

				            }// end if

			        	}

			        });

				} else {

					res.json( errorResInfo.BUILDING_OVER_LIMITATION_DENY.code , { 
						msg: errorResInfo.BUILDING_OVER_LIMITATION_DENY.msg
					});  

				}

			}

    	});

    }

};

// GET Interface for get building info
exports.read = function(req, res){

	if( req.params._id ){

	    // Get building
	    Building.findById(req.params._id, function(err, building) {

	        if( err ) {

	            log.error(err);
				res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
					msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				});  

			} else {

				if( building ) {

		            // Check permission
		            utilityS.validatePermission( req.user, building, Building.modelName, function(result) {

		            	if(result) {

		            		res.send( errorResInfo.SUCCESS.code , building);

		            	} else {

		        			res.json( errorResInfo.ERROR_PERMISSION_DENY.code , { 
		        				msg: errorResInfo.ERROR_PERMISSION_DENY.msg
		        			});

		            	}

		            }, true);

				} else {

        			res.json( errorResInfo.INCORRECT_PARAMS.code , { 
        				msg: errorResInfo.INCORRECT_PARAMS.msg
        			});  

				}

			}

	    });

	}

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
                            building.save(function(err, buildingS){
                                
                            	if( err ) {

                            		log.error(err);
				        			res.json( errorResInfo.INTERNAL_SERVER_ERROR.code , { 
				        				msg: errorResInfo.INTERNAL_SERVER_ERROR.msg
				        			});                              		

                            	} else {

	                                // Auto-package mapzip     			
									utilityS.packageMapzip(buildingS._id, function(errorObj){

										if(errorObj.code != 200){

											res.json(errorObj.code, {
												msg: errorObj.msg
											});

										}else{

											res.json(errorObj.code, errorObj.building);

										}

									});

                            	}

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
		var folderPath = path.dirname() + mapinfo_path + '/' + req.user._id + "/" + req.body._id,
			folderZipPath = folderPath + ".zip";
		
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
		

		// Remove building mapzip
		fs.exists(folderZipPath, function(exist){

			// Delete if exist
			if(exist)
				rimraf(folderZipPath, function(err){
					if(err)
						log.error(err);
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