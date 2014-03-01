var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * IndoorLocationRecord model
 */
var indoorLocationRecordSchema = new Schema({
	   
    lat: Number,

    lon: Number,

    timestamp: Date,

    floorId: String,

    mobileDeviceId: String
    
});

var indoorLocationRecord = mongoose.model( 'IndoorLocationRecord', indoorLocationRecordSchema );

module.exports = indoorLocationRecord;