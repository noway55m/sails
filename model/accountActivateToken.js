var mongoose = require("./dataSource.js"),
	config = require("../config/config.js"),
	Schema = mongoose.Schema;


/**
 * Account Activate Token model
 */
var accountActivateTokenSchema = new Schema({
	
    token: String, 
        
    userId: String,
    
	createdAt : {

		type : Date,

		expires : config.defaultTokenDuration

	}    
    
});

var accountActivateToken = mongoose.model( 'AccountActivateToken', accountActivateTokenSchema );

module.exports = accountActivateToken;