var log = require('log4js').getLogger("User"),
	crypto = require('crypto'),
    config = require('../config/config.js'),
    utilityS = require("./utility.js");

var defaultLocale = "en";

// Function for set locale on server local and browser cookie
function setLocale(req, res) {

	var locale = req.query.locale ? req.query.locale : 
		( req.cookies.locale ? req.cookies.locale: defaultLocale);

	// Set locale on server and cookie	
	req.setLocale(locale);
	res.locals.locale = locale;
	res.cookie('locale', locale, { 
		expires: new Date(Date.now() + 900000), 
		httpOnly: true 
	});		

}


// GET Interface for set locale
exports.setLocale = function(req, res){

	// Set locale on local server and cookie for specific session
	setLocale(req, res);

	// Redirect to original url
	var returnUrl = req.query.returnUrl
	if(returnUrl)
		res.redirect(returnUrl);
	else
		res.redirect("/user");

};

// Exports set locale function
exports.setLocaleF = setLocale;