var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * GeofencePolygonPoint model
 */
var geofencePolygonPointSchema = new Schema({
	   
    lat: Number,

    lon: Number,

    geofenceId: String
    
});

var geofencePolygonPoint = mongoose.model( 'GeofencePolygonPoint', geofencePolygonPointSchema );

module.exports = geofencePolygonPoint;