var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * PoiTag model
 */
var poiTagSchema = new Schema({
	
    name: String, 
    
    poiId: String,

    userId: String,

	createdDate: Date,

});

var poiTag = mongoose.model( 'PoiTag', poiTagSchema );

module.exports = poiTag;