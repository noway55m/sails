var mongoose = require("./dataSource.js"),
	Schema = mongoose.Schema;


/**
 * ApToFloor model (Many-To-Many relation between "Ap" and "Floor")
 */
var apToFloorSchema = new Schema({
	
	apId: Number,
		
	floorId: String    
    
});

var apToFloor = mongoose.model( 'ApToFloor', apToFloorSchema );

module.exports = apToFloor;