var mongoose = require("./dataSource"),
	Schema = mongoose.Schema,
	uuid = require('node-uuid'),
	crypto = require('crypto');
			
/**
 * User model
 */
var userSchema = new Schema({
	
    username: String,
    
    password: String,
    
    enabled: Boolean,
    
    country: Number, // Use default mapping
    
    role: {
    	
    	type: Number, // 1: admin, 2: developer, 3: free user 
    	default: 3
    	
    },
    
    token: String, // Developer token
    
    fid: String, // Facebook ID
    
    faccessToken: String, // Facebook OAuth access token    
    
    tid: String, // Twitter ID
    
    taccessToken: String ,// Twitter OAuth access token
    
    gid: String, // Google Plus ID

    gaccessToken: String // Google OAuth access token
        
});


var user = mongoose.model( 'User', userSchema );

// Function for encode password
user.encodePassword = function(password){	
	var shasum = crypto.createHash('sha1');
	shasum.update(password);
	var hashPasswd = shasum.digest('hex').toString();	
	return hashPasswd;		
};

// Function for generate token
user.genToken = function(){
	return uuid.v4().replace(/-/g, "");
};

// User static roles
user.ROLES = {
	ADMIN: 1,
	DEVELOPER : 2,
	FREE : 3		
};

module.exports = user;