var log = require('log4js').getLogger(), 
	Ad = require("../model/ad"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment');

// Static variable
var	resource_path = "./resource/",
	public_image_path = "client-image",
	mapzip_path = resource_path + "mapzip",
	image_path = "public/" + public_image_path;

// GET Page for show specific ad
exports.show = function(req, res) {

	Ad.findById(req.params._id, function(err, ad) {

		if (err)
			log.error(err);
		
		if(ad)
			res.render("ad/ad-show.html", {
				url: req.url.toString(), // use in layout for identify display info
				user: req.user,
				ad: ad,
				imagePath: public_image_path
			});

	});

};

// GET Interface for list the ads of store
exports.list = function(req, res) {

	if (req.query.storeId) {

		Ad.find({
			
			storeId : req.query.storeId
		
		}, function(err, ads) {
			
			if(err)
				log.error(err);
			
			var adsObj = [];
			for(var i=0; i<ads.length; i++)
				adsObj[i] = formatObjectDate(ads[i]);			
			res.send(200, adsObj);

		});

	}

};

// Interface for read specific ad of store
exports.read = function(req, res){
	
	if(req.params._id){
		
		Ad.findById(req.params._id, function(err, ad) {

			if (err)
				log.error(err);
			
			if(ad){
				var adObj = formatObjectDate(ad);
				res.send(200, adObj);
			}
		});			
		
	}
	
}; 

// Interface for create the new ad of store
exports.create = function(req, res){
	
	if(req.body.storeId && req.body.name && req.body.price && req.body.desc){
					
		new Ad({
			
		    name: req.body.name,
		    price: req.body.price,			    
		    desc: req.body.desc,			    
		    startTime: new Date(),			    		    
		    endTime: new Date(),			    
		    storeId: req.body.storeId
		    
		}).save(function(err, ad){
			
			if(err)
				log.error(err);
			
			if(ad){
				var adObj = formatObjectDate(ad);			
				res.send(200, adObj);
			}
		});	
		
	}
		
};

// Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	log.info(req.body);
	if(req.body._id && req.body.storeId && req.body.name && req.body.price && 
			req.body.desc){
		
		Ad.findById(req.body._id, function(err, ad) {
			
			if (err)
				log.error(err);
			
			if (ad) {				
				
				ad.name = req.body.name;
				ad.price = req.body.price;				
				ad.desc = req.body.desc;
				ad.startTime = new Date(req.body.startTime);
				ad.endTime = new Date(req.body.endTime);
				// ad.storeId = req.body.storeId;				
				ad.save(function(err, ad){
					
					if(err)
						log.error(err);
					
					if(ad){
						var adObj = formatObjectDate(ad);			
						res.send(200, adObj);											
					}
					
				});
			}

		});
	}
};		

// POST Interface of delete specific ad
exports.del = function(req, res){
	
	if(req.body._id){
		
		Ad.remove({ _id: req.body._id }, function(err){
			if(err)
				log.error(err);
			else
				res.json(200, {
					_id: req.body._id
				});				
				
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
				
				Ad.findById(req.body._id, function(error, ad){
					
					if(ad){
						
						log.info("image: " + ad.image);
						log.info("targetName: " + targetFileName);						
						if(ad.image != targetFileName){
							
							log.info("Update");
							fs.rename(tmpPath, targetPath, function(err) {			
								if(err){									
									log.error(err);
									res.send(200, "Server error, please try again later");									
								}else{									
									
									ad.image = targetFileName;
									ad.save(function(){
										res.send(200, targetFileName);																			
									});
								}										
							});								
							
						}else{
							
							log.info("Same");
							res.send(200,  targetFileName);							
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

// Function for clone object and format time
function formatObjectDate(ad){

	var adObj = JSON.parse(JSON.stringify(ad));
	adObj.startTime = moment(ad.startTime).format("MM/DD/YYYY").toString();
	adObj.endTime = moment(ad.endTime).format("MM/DD/YYYY").toString();		
	return adObj;
	
}