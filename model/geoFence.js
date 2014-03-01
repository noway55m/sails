var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Geofence model
 */
var geofenceSchema = new Schema({
	   
    name: String,

    floorId: String,

    createdTime: Date,

    updatedTime: Date
    
});

var geofence = mongoose.model( 'Geofence', geofenceSchema );

module.exports = geofence;