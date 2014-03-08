var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * UserMobileDevice model
 */
var userMobileDeviceSchema = new Schema({
	   
    userId: String,

    mobileDeviceId: String
    
});

var userMobileDevice = mongoose.model( 'UserMobileDevice', userMobileDeviceSchema );

module.exports = userMobileDevice;