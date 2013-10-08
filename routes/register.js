var log = require('log4js').getLogger("Register"),
    User = require("../model/user"),
    mailer = require('../config/nodemailerSetup');

/*
 * GET Register page
 */
exports.index = function(req, res) {
    res.render("register/index.html", {
    	url: req.url.toString(), // use in layout for identify display info
    	errorMsg: req.flash('msg') || ""
    });
};

/*
 * GET Interface for authenticate and register new user
 */
exports.auth = function(req, res) {
	
    if(req.body.email && req.body.password){
    
        var email = req.body.email.trim().toLowerCase(),
            passwd = req.body.password.trim();

        // Check duplicate user
        User.findOne({

            username : email

        }, function(err, user){
        
            if(err)
                log.error(err);

            if(user){

                req.flash('msg', "The email has been registered already.");
                res.redirect("/register");

            }else{
            
                new User({
            	
					username : email,
					password : User.encodePassword(passwd)

				}).save(function(err, nuser) {

					if (err)
						log.error(err);

					if (nuser) {

						// Send mail with defined transport object
						var mailOptions = {
							from : mailer.defaultOptions.from, // sender address
							to : email, // list of receivers
							subject : "Welcome join to Sails Cloud Service", // Subject line
							text : "Welcome join to Sails Cloud Service", // plaintext body
							html : "<b>Welcome join to Sails Cloud Service</b>" // html body
						};

						mailer.sendMail(mailOptions, function(error, response) {
							if (error) {
								console.log(error);
							} else {
								console.log("Message sent: " + response.message);
							}

						});

						// Redirect to index page
						res.redirect("/");

					}
				});

            }

        });

    }

};
c