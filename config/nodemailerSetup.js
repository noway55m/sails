var nodemailer  = require('nodemailer'),
	config = require('./config.js');

var options = {};

// Check is china version for decide SMTP service
// Setup SMTP service
if(config.chinaVersion) {
	
	options.host = "smtp.163.com";
	options.secureConnection = true; // SSL
	options.port = 465;
	options.auth = {
		user: config.mailerChina.user,
		pass: config.mailerChina.pass
	};

} else {

	options.service = "Gmail";
	options.auth = {
		user: config.mailer.user,
		pass: config.mailer.pass,
	};

}
var mailer = nodemailer.createTransport("SMTP", options);

// Setup mail from
if(config.chinaVersion) {

	mailer.defaultOptions = {
	    from : config.mailerChina.from,
	};	

} else {
	
	mailer.defaultOptions = {
	    from : config.mailer.from,
	};
		
}

module.exports = mailer;