var log = require('log4js').getLogger(), 
	Store = require("../model/store"),
	Ad = require("../model/store"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	config = require('../config/config');

// Static variable
var	image_path = config.imagePath;

// Page for show the store in the floor of specific building
exports.show = function(req, res) {	
	res.render("store/store-show.html");
};

// GET¡@Interface for read the store in the floor of specific building
exports.read = function(req, res) {
	
	Store.findById(req.params._id, function(error, store){
		
		if(error)
			log.error(error);
		
		if(store)
			res.send(200, store);
		
	});

};


// Interface for list the stores in specific floor of specific building
exports.list = function(req, res) {
	
	if (req.query.floorId) {

		Store.find({
			
			floorId : req.query.floorId
		
		}, function(error, stores) {
			
			res.send(200, stores);

		});

	}

};


// POST Interface for create the new store in specific floor of specific building
exports.create = function(req, res){
	
	if(req.body.name && req.body.floorId){
		
		Store.find({
			
			name: req.body.name,
			floorId: req.body.floorId
			
		}, function(err, stores){
			
			if(err)
				log.error(err);
			
			if(stores.length > 0){
				
				res.json(200, {
					msg: "Store name is duplicate!"
				});
				
			}else{
				
				new Store({				
				    name: req.body.name,
				    link: req.body.link,			    
				    phone: req.body.phone,			    
				    memo: req.body.memo,			    		    
				    floorId: req.body.floorId,				    
				}).save(function(error, store){				
					res.send(200, store);			
				});	
				
			}
			
		});
				
	}
		
};

// POST Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	if(req.body._id && req.body.name){
		
		Store.findById(req.body._id, function(err, store) {
			
			if (err)
				log.error(err);
			
			if(store){
				
				Store.find({
					
					name: req.body.name,
					floorId: store.floorId
					
				}, function(err, stores){
					
					if(err)
						log.error(err);
					
					if(stores.length > 1){
						
						res.json(200, {
							msg: "Store name is duplicate!"
						});
						
					}else{
						
						store.name = req.body.name;
						store.phone = req.body.phone;				
						store.link = req.body.link;
						store.memo = req.body.memo;
						// store.floorId = req.body.floorId; not support now			
						store.save(function(){
							res.send(200, store);
						});						
						
					}
					
				});
				
			}

		});
		
	}
	
};		


// POST Interface for delete the store and relative ads
exports.del = function(req, res){
	
	if(req.body._id){
		
		Store.findById(req.body._id, function(err, store){
			
			if(err)
				log.error(err);
			
			if(store){
				
				// Delete store image									
				var oldImgPath = path.resolve(image_path + "/" + store.icon);
				fs.unlink(oldImgPath, function(err){
					log.error(err);
				});	
				
				res.json(200, {
					_id: req.body._id
				});
				
				// Find all relative ads
				Ad.find({
					
					storeId: req.body._id 
				
				}, function(err, ads){
					
					if(err)						
						log.error(err);

					for(var i=0; i<ads.length; i++){
						
						// Delete ad image									
						var oldAdImgPath = path.resolve(image_path + "/" + ads[i].image);
						fs.unlink(oldAdImgPath, function(err){
							log.error(err);
						});
						
						ads[i].remove(function(err){
							log.error(err);
						});
						
					}					
					
				});					
				
			}
			
		});		
				
	}
		
};


// POST Interface of upload image
exports.uploadImage = function(req, res) {

	if(req.body._id && req.files.image){
		
		// Get file name and extension
		var fileName = req.files.image.name;
		var extension = path.extname(fileName).toLowerCase() === '.png' ? ".png" : null ||
						path.extname(fileName).toLowerCase() === '.jpg' ? ".jpg" : null ||
						path.extname(fileName).toLowerCase() === '.gif' ? ".gif" : null;
		
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
				
				Store.findById(req.body._id, function(error, store){
					
					if(store){
						
						log.info("icon: " + store.icon);
						log.info("targetName: " + targetFileName);						
						if(store.icon != targetFileName){
							
							log.info("Update");
							fs.rename(tmpPath, targetPath, function(err) {			
								if(err){									
									log.error(err);
									res.send(200, "Server error, please try again later");									
								}else{									
									
									// Delete old image									
									var oldImgPath = path.resolve(image_path + "/" + store.icon);
									fs.unlink(oldImgPath, function(err){
										log.error(err);
									});									
									
									store.icon = targetFileName;
									store.save(function(){
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