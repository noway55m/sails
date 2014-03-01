var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Geofence model
 */
var geofenceSchema = new Schema({
	   
    name: String,

    floorId: String
    
});

var geofence = mongoose.model( 'Geofence', geofenceSchema );

module.exports = geofence;