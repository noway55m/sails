var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Ap model
 */
var apSchema = new Schema({
	
	apId: Number,
	
	ssid: String,
	
	maxholdpwd: Number    
    
});

var ap = mongoose.model( 'Ap', apSchema );

module.exports = ap;