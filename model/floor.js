var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Floor model
 */
var floorSchema = new Schema({
	
    name: String, // *require and unique
    
    desc: String,
    
    layer: Number, // basement: -1, -2, .., -n ; floor: 1, 2, .. m
    
    map: String, // File path of map.xml
    
    path: String, // File path of path.xml
    
    render: String, // File path of render.xml
    
    region: String, // File path of region.xml
    
    buildingId: String
    
});

var floor = mongoose.model( 'Floor', floorSchema );

module.exports = floor;