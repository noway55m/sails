var mongoose = require("./dataSource"),
	Schema = mongoose.Schema,
	uuid = require('node-uuid'),
	crypto = require('crypto');
			
/**
 * Feedback model
 */
var feedbackSchema = new Schema({
	
    name: String,
    
    email: String,
    
    comment: String,
        
    createdTime: Date

});


var feedback = mongoose.model( 'Feedback', feedbackSchema );

module.exports = feedback;