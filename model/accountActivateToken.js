var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Account Activate Token model
 */
var accountActivateTokenSchema = new Schema({
	
    token: String, 
        
    userId: String
    
});

var accountActivateToken = mongoose.model( 'AccountActivateToken', accountActivateTokenSchema );

module.exports = accountActivateToken;