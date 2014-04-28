var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema,
	uuid = require('node-uuid');


/**
 * DeveloperApplication model
 */
var developerApplicationSchema = new Schema({
	
    apiKey: String, 
    
    type: String, // 1: Android, 2: IOS, 3: Server, 4: Browser
	
    verifier: String, // Android: SHA1 certificate fingerprint and package name, IOS: bundle id, Server: IPs, Browser: Domain Names 

    createdTime: Date,

    updatedTime: Date,

    userId: String    
    
});

var developerApplication = mongoose.model( 'DeveloperApplication', developerApplicationSchema );

developerApplication.API_KEY_TYPE = {
    ANDROID: 1,
    IOS: 2,
    SERVER: 3,
    BROWSER: 4
}

// Function for generate token
developerApplication.genApiKey = function(){
	return uuid.v4().replace(/-/g, "");
};

module.exports = developerApplication;