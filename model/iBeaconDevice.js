var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * iBeaconDevice model
 */
var iBeaconDeviceSchema = new Schema({
	   
    deviceUid: String,

    macAddress: String,

    name: String,

    lat: Number,

    lon: Number,

    floorId: String
    
});

var iBeaconDevice = mongoose.model( 'iBeaconDevice', iBeaconDeviceSchema );

module.exports = iBeaconDevice;