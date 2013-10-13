var mongoose = require("./dataSource.js"),
	config = require("../config/config.js"),
	Schema = mongoose.Schema;


/**
 * Reset Password Token model
 */
var resetPasswordTokenSchema = new Schema({
	
    token: String, 
        
    userId: String,
    
	createdAt : {

		type : Date,

		expires : config.defaultTokenDuration

	}
        
});

var resetPasswordToken = mongoose.model( 'ResetPasswordToken', resetPasswordTokenSchema );

module.exports = resetPasswordToken;