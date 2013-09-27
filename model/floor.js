var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Floor model
 */
var floorSchema = new Schema({
	
    name: String, // *require and unique
    
    layer: Number, 
    
    buildingId: String
    
});

var floor = mongoose.model( 'Floor', floorSchema );

module.exports = floor;