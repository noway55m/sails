var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Custom fields model
 */
var customFields = new Schema({ 

    key: String,

    value: String,

    type: Number

});

/**
 * Poi model
 */
var poiSchema = new Schema({
	
    name: String, 
    
    // Schema.Types.Mixed is same as Object {}
    // There are some predefined types about custom fields:
    // type => 1: string, 2: link, 3: image, 4: video, 5: audio , 6: file    
    customFields: [customFields],//Schema.Types.Mixed,

    tags: [], // todo array better for easy to response, not execute second query on table PoiTags

    buildingId: {

        type: String,
        index: true

    },

    userId: {

        type: String,
        index: true

    },

	createdTime: Date,

	updatedTime: Date

});

var poi = mongoose.model( 'Poi', poiSchema );

module.exports = poi;