var mongoose = require("./dataSource.js"),
	config = require("../config/config.js"),
	Schema = mongoose.Schema;


/**
 * Cookie Token model
 */
var cookieTokenSchema = new Schema({

	token : String,

	userId : String,

	createdAt : {

		type : Date,

		expires : config.defaultCookieDuration

	}

});

var cookieToken = mongoose.model( 'CookieToken', cookieTokenSchema );

module.exports = cookieToken;