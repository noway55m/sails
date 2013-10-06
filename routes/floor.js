var log = require('log4js').getLogger(),
	Store = require("../model/store"),
    Floor = require("../model/floor"),
    Building = require("../model/building"),
    fs = require('fs'),
	path = require('path'),
	mkdirp = require("mkdirp"),
	parseString = require('xml2js').parseString;

// Static variable
var	resource_path = "./resource/",
	public_image_path = "client-image",
	mapzip_path = resource_path + "mapzip",
	image_path = "public/" + public_image_path;

/*
 * GET Page of specific building
 */
exports.show = function(req, res) {

	Floor.findById(req.params._id, function(err, floor) {

		if (err)
			log.error(err);
		
		if(floor)
			res.render("floor/floor-show.html", {
				url: req.url.toString(), // use in layout for identify display info
				user: req.user,
				floor: floor,
				imagePath: public_image_path
			});

	});

};

/*
 * GET Interface for read specific floor
 */
exports.read = function(req, res) {

	// Get floor
	Floor.findById(req.params._id, function(err, floor) {

		if (err)
			log.error(err);

		if (floor) {
			res.send(200, floor);
		}

	});

};

/*
 * GET Interface for list floors of specific building
 */
exports.list = function(req, res) {

	Floor.find({

		buildingId: req.query.buildingId

	}).sort({layer: -1}).execFind(function(error, floors){

		if (error)
			log.error(error);

		res.send(200, floors);

	});

};


/*
 * POST Interface for create floor of building
 */
exports.create = function(req, res) {

	if(req.body.buildingId && req.body.layer){

		new Floor({

			layer: req.body.layer,

			buildingId: req.body.buildingId

		}).save(function(error, floor){

			Building.findById(req.body.buildingId, function(error, building){

				if(req.body.layer>0)
					building.upfloor = req.body.layer;
				else
					building.downfloor = Math.abs(req.body.layer);

				building.save(function(){
					res.send(200, floor);
				});

			});

		});

	}

};


/*
 * POST Interface for update floor of building
 */
exports.update = function(req, res) {
	
	console.log(req.body)
    if(req.body._id){

        // Get building
        Floor.findById(req.body._id, function(err, floor){

            if(err)
                log.error(err);

            if(floor){
                floor.name = req.body.name;
                floor.desc = req.body.desc;
                floor.save(function(){
                    res.send(200, floor);
                });
            }

        });

    }
    
};


/*
 * POST Interface for upload path.xml and map.xml
 */
exports.uploadMapAndPath = function(req, res) {
	
	console.log(req.body)
	console.log(req.files)
	if(req.body._id && req.files.map && req.files.path){

	    // get the temporary location of the file
	    var tmpPathPath = req.files.path.path,
	    	tmpPathMap = req.files.map.path;
	    
	    		
	    fs.exists(path.dirname + '/resource/map-info/' + req.user._id , function (exists) {
	    	
	    	console.log(exists)
	    	var folderPath = path.dirname() + '/resource/map-info/' + req.user._id;
	    	if(!exists){
	    			
	    		  mkdirp(folderPath , function (err, dd) {
	    			    if (err) 
	    			    	console.log(err)

					    // set where the file should actually exists - in this case it is in the "images" directory
					    var targetPathPath = folderPath + "/path.xml",
					    	targetPathMap = folderPath + "/map.xml";
	    			    	
	    			    	
	    			    console.log(targetPathPath)
					    console.log(targetPathMap)
					    
	    			    // move the file from the temporary location to the intended location
					    fs.rename(tmpPathPath, targetPathPath, function(err) {
					        if (err) throw err;
					        
					        // delete the temporary file, so that the explicitly set temporary upload dir 
					        // does not get filled with unwanted files
					        fs.unlink(tmpPathPath, function() {
					            
					        	if (err) 
					            	throw err;
					            
					    	    fs.rename(tmpPathMap, targetPathMap, function(err) {
					    	        if (err) throw err;
					    	        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
					    	        fs.unlink(tmpPathMap, function() {
					    	            if (err) throw err;
					    	            res.send(200, 'File uploaded to');
					    	        });
					    	    });
					    	    
					        });
					        
					    });	    			    	
	    			    
	    		  })
	    	}
	    	
	    });

	}

};


/*
 * POST Interface for upload render.xml and region.xml
 */
exports.uploadRenderAndRegion = function(req, res) {
	
	console.log(req.body)
	console.log(req.files)
	if(req.body._id && req.files.render && req.files.region){

	    // get the temporary location of the file
	    var tmpPathRender = req.files.render.path,
	    	tmpPathRegion = req.files.region.path;
	    
	    		
	    fs.exists(path.dirname + '/resource/map-info/' + req.user._id , function (exists) {
	    	
	    	console.log(exists)
	    	var folderPath = path.dirname() + '/resource/map-info/' + req.user._id;
	    	if(!exists){
	    			
	    		  mkdirp(folderPath , function (err, dd) {
	    			    if (err) 
	    			    	console.log(err);

					    // set where the file should actually exists - in this case it is in the "images" directory
					    var targetPathRender = folderPath + "/render.xml",
					    	targetPathRegion = folderPath + "/region.xml";
	    			    	
	    			    	
	    			    console.log(targetPathRender)
					    console.log(targetPathRegion)
					    
	    			    // move the file from the temporary location to the intended location
					    fs.rename(tmpPathRender, targetPathRender, function(err) {
					        if (err) throw err;
					        
					        // delete the temporary file, so that the explicitly set temporary upload dir 
					        // does not get filled with unwanted files
					        fs.unlink(tmpPathRender, function() {
					            					        	
					        	if (err) 
					            	throw err;
					            
					    	    fs.rename(tmpPathRegion, targetPathRegion, function(err) {
					    	        if (err) throw err;
					    	        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
					    	        fs.unlink(tmpPathRegion, function() {
					    	            
					    	        	if (err) 
					    	            	throw err;
					    	        	
					    	        	// Response first
					    	        	res.json(200, {
					    	        		msg: "Upload successfully"
					    	        	});
							        	
					    	        	// Start to parse region.xml file and 
					    	        	fs.readFile(targetPathRegion, 'utf8', function (err,data) {
							        		  if (err) {
							        		    return console.log(err);
							        		  }
							        		  if(data)
							        			  parseRegion(data, req.body._id);
							        	});					    	        	
					    	        						    	        	
					    	        	
					    	        });
					    	    });
					    	    
					        });
					        
					    });	    			    	
	    			    
	    		  })
	    	}
	    	
	    });

	}

};


// Function for parse regions and create stores on these floor 
function parseRegion(regionXMLString, floorId, next){
	
	//console.log(regionXMLString);
	parseString(regionXMLString, function (err, result) {
	    //console.dir(result);
	    var ways = result.osm.way;
	    console.log("-------------------------------------");
	    
	    Store.find({}, function(err, stores){
	    	
	    	if(err)
	    		log.error(err);
	    	
		    ways.forEach(function(way){
		    	
		    	var tags = way.tag;
		    	tags.forEach(function(tag){
		    		
		    		//console.log(tag.$);
		    		var tagInfo = tag.$;
		    		if(tagInfo.k == "label"){
		    			
		    			var name = tagInfo.v,
		    				isDuplicate = false;
		    			console.log(name);
		    			
		    			// Check is duplicate
		    			for(var i=0; i< stores.length; i++){		    				
		    				if(name == stores[i].name){
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
		    		
		    	});
		    	
		    });	    	
	    	
	    	
	    });
	    
	    
	});	
	
}
