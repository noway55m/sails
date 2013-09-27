var mongoose = require("./dataSource"),
	Schema = mongoose.Schema,
	crypto = require('crypto');
			
/**
 * User model
 */
var userSchema = new Schema({
	
    username: String,
    
    password: String,
    
    country: Number, // Use default mapping
    
    role: {
    	
    	type: Number, // 1: admin, 2: normal user
    	default: 2
    	
    },
    
    fid: String, // facebook id
    
    accessToken: String // facebook OAuth access token    
            
});


var user = mongoose.model( 'User', userSchema );

// Function for encode password
user.encodePassword = function(password){	
	var shasum = crypto.createHash('sha1');
	shasum.update(password);
	var hashPasswd = shasum.digest('hex').toString();	
	return hashPasswd;		
};

module.exports = user;