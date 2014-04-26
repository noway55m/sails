var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema,
	uuid = require('node-uuid'),
	crypto = require('crypto');	


/**
 * Sdk model
 */
var sdkSchema = new Schema({
	
    version: String,

    isCurrentVersion: {

    	type: Boolean,
    	default: false
    	   		
    },
    
    osType: Number, // 1: android, 2: ios

    createdTime: Date,

    updatedTime: Date,

    sdkFilePath: String,

    sampleCodeFilePath: String
        
});

var sdk = mongoose.model( 'Sdk', sdkSchema );

sdk.OS_TYPE = {
	ANDROID: 1,
	IOS: 2
}

sdk.getSdkFileName = function(version){
	return "SAILS_SDK_V" + version + "_Published";
}

sdk.getSampleCodeFileName = function(version){
	return "SAILS_SAMPLE_CODE_V" + version + "_Published";
}

module.exports = sdk;	