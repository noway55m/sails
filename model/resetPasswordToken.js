var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Reset Password Token model
 */
var resetPasswordTokenSchema = new Schema({
	
    token: String, 
        
    userId: String
    
});

var resetPasswordToken = mongoose.model( 'ResetPasswordToken', resetPasswordTokenSchema );

module.exports = resetPasswordToken;