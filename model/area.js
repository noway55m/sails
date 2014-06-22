var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * Area model
 */
var areaSchema = new Schema({
	
    name: String,

    desc: String,

    pub: { // true: public, false: private
    	
    	type: Boolean,
    	default: false
    	
    }, 

    userId: String,

    createdTime: Date,

    updatedTime: Date
    
});

var area = mongoose.model( 'Area', areaSchema );

module.exports = area;