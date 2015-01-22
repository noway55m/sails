var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Building model
 */
var buildingSchema = new Schema({
	
    name: String, // *require and unique
    
    type: Number, // hotel, airport ..
    
    pub: { // true: public, false: private
    	
    	type: Boolean,
    	default: false
    	
    }, 
    
    upfloor: {
    	
    	type: Number,
    	default: 0
    
    }, // *require

    downfloor: {
    	
    	type: Number,
    	default: 0
    
    }, // *require
        
    icon: String, // icon path
    
    desc: String, // description about this building
    
    mapzip: String, // *require
    
    mapzipUpdateTime: Date, // *require       
    
    userId: { // Not nomalize userId for easy to query user's building    

        type: String,
        index: true

    }, 

    address: String,

    createdTime: Date
               
});

var building = mongoose.model( 'Building', buildingSchema );

module.exports = building;