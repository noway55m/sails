var log = require('log4js').getLogger(), 
	Store = require("../model/store");

// Interface for show the store in the floor of specific building
exports.index = function(req, res) {

	if (req.params.id) {

		Store.findById(req.params.id, function(error, building){
			
			if(error)
				log.error(err);
			
			if(building)
				res.render("store/index.html");
			
		});

	}

}

// Interface for read the store in the floor of specific building
exports.read = function(req, res) {

	if (req.params.id) {

		Store.findById(req.params.id, function(error, store){
			
			if(error)
				log.error(err);
			
			if(building)
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
	if(req.body.name && req.body.floor && req.body.id){
		
		new Store({
		
		    name: req.body.name,
		    		    
		    link: req.body.link,
		    
		    phone: req.body.phone,
		    
		    memo: req.body.memo,
		    
		    //icon: Number, 
		    		    
		    floor: req.body.floor,
		    
		    buildingId: req.body.id
			
			
		}).save(function(error, store){
			
			res.send(200, store);
		
		});
		
	}
		
}

// Interface for create the new store in specific floor of specific building
exports.update = function(req, res){
	
	log.info(req.body);
	if(req.body.id){
		
		new Store({
		
		    name: req.body.name,
		    		    
		    link: req.body.link,
		    
		    phone: req.body.phone,
		    
		    memo: req.body.memo,
		    
		    //icon: Number, 
		    		    
		    floor: req.body.floor,
		    
		    buildingId: req.body.id
			
			
		}).save(function(error, store){
			
			res.send(200, store);
		
		});
		
	}
}		
