var log = require('log4js').getLogger(), 
	Store = require("../model/store"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path');

// Static variable
var	resource_path = "./resource/",
	public_image_path = "client-image",
	image_path = "public/" + public_image_path;	

// Interface for show the store in the floor of specific building
exports.index = function(req, res) {

	if (req.params.id) {

		Store.findById(req.params.id, function(error, store){
			
			if(error)
				log.error(error);
			
			if(store)
				res.render("store/index.html", {
					url: req.url.toString(), // use in layout for identify display info
					user: req.user,
					imagePath: public_image_path
				});
			
		});

	}

}

// Interface for read the store in the floor of specific building
exports.read = function(req, res) {
	
	console.log(req.params);
	if (req.params.id) {

		Store.findById(req.params.id, function(error, store){
			
			if(error)
				log.error(err);
			
			if(store)
				res.send(200, store);
			
		});

	}

}

// Interface for list the stores in specific floor of specific building
exports.list = function(req, res) {

	log.info(req.query);
	if (req.query.buildingId && req.query.floor) {

		Store.find({
			
			floor : parseInt(req.query.floor),
			buildingId : req.query.buildingId
		
		}, function(error, stores) {
			
			console.log(stores);
			res.send(200, stores);

		});

	}

}

// Interface for create the new store in specific floor of specific building
exports.create = function(req, res){
	
	log.info(req.body);
	if(req.body.name && req.body.floor && req.body.buildingId){
		
		if(req.files.icon){
			
			// Get file name and extension
			var fileName = req.files.icon.name;
			var extension = path.extname(fileName).toLowerCase() === '.png' ? ".png" : null ||
							path.extname(fileName).toLowerCase() === '.jpg' ? ".jpg" : null ||
							path.extname(fileName).toLowerCase() === '.gif' ? ".gif" : null;
			console.log(extension);
											
			// Check file format by extension
			if(extension){
				
				var tmpPath = req.files.icon.path;
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
					new Store({						
					    name: req.body.name,					    		    
					    link: req.body.link,					    
					    phone: req.body.phone,					    
					    memo: req.body.memo,					    
					    icon: targetFileName, 					    		    
					    floor: req.body.floor,					    
					    buildingId: req.body.buildingId												
					}).save(function(error, store){						
						res.send(200, store);					
					});										
					
				});
				
			}else{				
				res.send(200, { msg: "Icon format should be png, jpg or gif" });				
			}				
						
		}else{
			
			new Store({				
			    name: req.body.name,
			    link: req.body.link,			    
			    phone: req.body.phone,			    
			    memo: req.body.memo,			    		    
			    floor: req.body.floor,			    
			    buildingId: req.body.buildingId								
			}).save(function(error, store){				
				res.send(200, store);			
			});				
			
		}
		
	}
		
}

// Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	log.info(req.body);
	if(req.body._id && req.body.buildingId && req.body.floor && req.body.name && 
			req.body.phone && req.body.link && req.body.memo){
		
		Store.findById(req.body._id, function(err, store) {
			
			if (err)
				log.error(err);
			
			if (store) {				
				store.name = req.body.name;
				store.phone = req.body.phone;				
				store.link = req.body.link;
				store.memo = req.body.memo;
				store.floor = req.body.floor;
				// store.buildingId = req.body.buildingId;				
				store.save(function(){
					res.send(200, store);
				});
			}

		});
	}
}		


/*
 * POST Interface of upload image
 */
exports.uploadImage = function(req, res) {

	if(req.body.id && req.files.image){
		
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
				
				Store.findById(req.body.id, function(error, store){
					
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
									
									store.icon = targetFileName;
									store.save(function(){
										res.send(200, "/client-image/" + targetFileName);																			
									});
								}										
							});								
							
						}else{
							
							log.info("Same");
							res.send(200, "/client-image/" + targetFileName);							
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