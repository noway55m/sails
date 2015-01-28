var nodemailer  = require('nodemailer'),
	config = require('./config.js');

var options = {};

// Check is china version or not for decide the SMTP
if(config.chinaVersion) {
	
	options.host = "smtp.163.com";
	options.secureConnection = true; // SSL
	options.port = 465;
	options.auth = {
		user: "noway55m@163.com",
		pass: "mar96479"
	};

} else {

	options.service = "Gmail";
	options.auth = {
		user: "admin@sailstech.com",
		pass: "felix123"
	};

}

var mailer = nodemailer.createTransport("SMTP", options);

mailer.defaultOptions = {
    from : "admin@sailstech.com"
};

module.exports = mailer;