var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * MobileDevice model
 */
var mobileDeviceSchema = new Schema({
	   
    osType: Number,

    mdUid: String,

    macAddress: String
    
});

var mobileDevice = mongoose.model( 'MobileDevice', mobileDeviceSchema );

module.exports = mobileDevice;