var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Poi model
 */
var poiSchema = new Schema({
	
    name: String, 
    
    customFields: Schema.Types.Mixed, // same as set => {} , example: { buildingName: "dddd", isShow: true }

    tags: String, // for easy to response, not execute second query on table PoiTags

	areaId: String,

	createdDate: Date,

	updatedDate: Date

});

var poi = mongoose.model( 'Poi', poiSchema );

module.exports = poi;