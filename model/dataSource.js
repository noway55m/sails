var mongoose = require('mongoose');
var database = {

	dev: {

		uri: "mongodb://localhost:27017/sails",
		options: {
		  user: 'USERNAME',
		  pass: 'PASSWORD'
		}

	},

	test: {

		uri: "mongodb://localhost:27017/sails",
		options: {
		  user: 'USERNAME',
		  pass: 'PASSWORD'
		}

	},

	prod: {

		uri: "mongodb://localhost:27017/sails",
		options: {
		  user: 'USERNAME',
		  pass: 'PASSWORD'
		}

	}

};

console.log("Database get config env: " + process.CONFIG_ENV);
var env = process.CONFIG_ENV; 
var uri = "";
var options = "";
if(env == "dev") {

	uri = database.dev.uri;
	options = database.dev.options;	

} else if(env == "test") {

	uri = database.test.uri;
	options = database.test.options;	
	
} else {

	uri = database.prod.uri;
	options = database.prod.options;	

}

console.log("----------------- DATABASE " + env + "-----------------");
console.log(uri);
console.log(options);
console.log("----------------- DATABASE " + env + "-----------------");

mongoose.connect( uri, options );
module.exports = mongoose;