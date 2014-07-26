var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * PoiEvent model
 */
var poiEventSchema = new Schema({
	
    title: String, 
    
    desc: String, 

    startTime: Date,

    endTime: Date,

	createdTime: Date,

	updatedTime: Date

});

var poiEvent = mongoose.model( 'PoiEvent', poiEventSchema );

module.exports = poiEvent;