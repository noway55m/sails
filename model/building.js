var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Building model
 */
var buildingSchema = new Schema({
	
    name: String, // *require and unique
    
    type: Number, // hotel, airport ..
    
    pub: Boolean, // true: public, false: private
    
    upfloor: {
    	
    	type: Number,
    	default: 1
    
    }, // *require

    downfloor: {
    	
    	type: Number,
    	default: 0
    
    }, // *require
        
    icon: String, // icon path
    
    desc: String, // description about this building
    
    mapzip: String, // *require
    
    mapzipUpdateTime: Date, // *require       
    
    userId: String,
               
});

var building = mongoose.model( 'Building', buildingSchema );

module.exports = building;