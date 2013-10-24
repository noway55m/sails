var log = require('log4js').getLogger(), 
	User = require("../model/user"),
	Building = require("../model/building"),
	Floor = require("../model/floor"),
	Store = require("../model/store"),    
	Ad = require("../model/ad");    

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

module.exports = Utility;