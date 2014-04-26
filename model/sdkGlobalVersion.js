var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema
	uuid = require('node-uuid'),
	crypto = require('crypto');
			
/**
 * Sdk Global Version model
 */
var sdkGlobalVersionSchema = new Schema({
	
    ios: String,

    android: String
        
});

var sdkGlobalVersion = mongoose.model( 'SdkGlobalVersion', sdkGlobalVersionSchema );

module.exports = sdkGlobalVersion;