var http = require('http')
  , https = require('https')
  , config = require('../config/config.js'); 

function GoogleRecaptcha(){}


GoogleRecaptcha.verify = function(privatekey , remoteip, challenge, response, next){

	var url = "www.google.com";
	var path = "/recaptcha/api/verify";

	// Construct url and params
	var payload = "privatekey=" + privatekey
			+ "&remoteip=" + remoteip	// google analytics user account id  
			+ "&challenge=" + challenge  // req.user._id
			+ "&response=" + response;

    // Setup header
	var headers = {};
	headers['Content-Length'] = payload.length;
	headers['Content-Type'] = 'application/x-www-form-urlencoded';

	var options = {
		hostname: url,
		port: 80,
		path: path,
		method: 'POST',
		headers: headers
	};


	console.log(options);
	console.log(payload);
	var reqest = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    var result = chunk;
	    next(result);
	  });
	  
	});

	reqest.on('error', function(e) {
	  console.log('Recaptcha request error: ' + e.message);
	});

	reqest.write(payload);				
	reqest.end();

}


module.exports = GoogleRecaptcha;