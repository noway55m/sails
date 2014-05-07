var passport = require('passport'),
	facebookStrategy = require('passport-facebook').Strategy,
	twitterStrategy = require('passport-twitter').Strategy,
	googleStrategy = require('passport-google-oauth').OAuth2Strategy,	
	localStrategy = require('passport-local').Strategy,
	log = require('log4js').getLogger(),
	User = require('../model/user'),
	CookieToken = require('../model/cookieToken'),	
	DeveloperApplication = require('../model/developerApplication'),
	SdkGlobalVersion = require('../model/sdkGlobalVersion'),		
	config = require('./config.js'),
	utilityS = require("../routes/utility.js");


//Static variable
var	resource_path = "./resource/",
	public_image_path = "client-image",
	mapzip_path = resource_path + "mapzip",
	image_path = "public/" + public_image_path;



// Session user serialize and de-serialize
passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {	
	User.findById(id, function(error, user){		
		done(error, user);		
	});	
});

// Authentication setup
passport.use(new localStrategy(function(username, password, done) {

	log.info("authentication username: " + username);
	
	User.findOne({
		
		username: username,			
		password: User.encodePassword(password)
		
	}, function(err, user){
		
		if(err)
			done(err);
		
		if (user) {

			log.info(user);
			
			// Check user account has been activated or not
			if(user.enabled)
				return done(null, user);
			else
				return done(null, false, {
					message : 'User account not activate yet'
				});				
			
		} else {

			return done(null, false, {
				message : 'Incorrect username or password!!'
			});

		}		
		
	});

}));

// Passport facebook OAuth configuration
passport.use(new facebookStrategy({

	clientID : config.facebookAppKey,
	clientSecret : config.facebookAppSecret,
	callbackURL : "/auth/facebook/callback"

}, function(accessToken, refreshToken, profile, done) {
	
	log.info("Facebook OAuth");
	log.info("accessToken: " + accessToken);
	log.info("refreshToken: " + refreshToken);
	log.info(profile);
	User.findOne({
		
		fid: profile.id
		
	}, function(err, user){
		
		log.info(user);
		if (user) {

			log.info("old user");
			
			// Update access token
			user.faccessToken = accessToken;
			user.save();
			done(err, user);

		} else {

			log.info("new user");
			
			// Create new user
			new User({
								
				username : profile.username,				
				fid : profile.id,
				faccessToken : accessToken
				
			}).save(function(err, newUser){
				
				if (newUser) {

					log.info('Successfully Insert User ' + newUser.username);
					
					// Start to create default building after response
					utilityS.createSampleBuilding(newUser, function(){						
						done(err, newUser);						
					});					
										
				} else {

					log.info('Failed to create new user ' + profile.username);
					return done(null, false, { message : 'Server error, fail to create new user ' + profile.username });

				}				
			});

		}		
		
	});

}));

// Passport twitter OAuth configuration
passport.use(new twitterStrategy({

	consumerKey : config.twitterAppKey,
	consumerSecret : config.twitterAppSecret,
	callbackURL : "/auth/twitter/callback"

}, function(accessToken, tokenSecret, profile, done) {

	log.info("Twitter OAuth");
	log.info("token: " + accessToken);
	log.info("tokenSecret: " + tokenSecret);
	log.info(profile);
	User.findOne({

		tid : profile.id

	}, function(err, user) {

		log.info(user);
		if (user) {

			log.info("old user");

			// Update access token
			user.taccessToken = accessToken;
			user.save();
			done(err, user);

		} else {

			log.info("new user");

			// Create new user
			new User({

				username : profile.username,
				tid : profile.id,
				taccessToken : accessToken

			}).save(function(err, newUser) {

				if (newUser) {

					log.info('Successfully Insert User ' + newUser.username);
					done(err, newUser);

				} else {

					log.info('Failed to create new user ' + profile.username);
					return done(null, false, {
						message : 'Server error, fail to create new user ' + profile.username
					});

				}
			});

		}

	});

}));


// Passport google plus OAuth configuration
passport.use(new googleStrategy({

	clientID : config.googleAppKey,
	clientSecret : config.googleAppSecret,
	callbackURL : "/auth/google/callback"

}, function(accessToken, tokenSecret, profile, done) {

	log.info("Google Plus OAuth");
	log.info("token: " + accessToken);
	log.info("tokenSecret: " + tokenSecret);	
	log.info(profile);
	User.findOne({

		gid : profile.id

	}, function(err, user) {

		log.info(user);
		if (user) {

			log.info("old user");

			// Update access token
			user.gaccessToken = accessToken;
			user.save();
			done(err, user);

		} else {

			log.info("new user");

			// Create new user
			new User({

				username : profile.username,
				gid : profile.id,
				gaccessToken : accessToken

			}).save(function(err, newUser) {

				if (newUser) {

					log.info('Successfully Insert User ' + newUser.username);
					done(err, newUser);

				} else {

					log.info('Failed to create new user ' + profile.username);
					return done(null, false, {
						message : 'Server error, fail to create new user ' + profile.username
					});

				}
			});

		}

	});

}

));



// Function for configure secure get and secure post
passport.configSecureHttpRequest = function(app){

    // Inner function for check isLoggedIn or not
    function isLoggedIn(req, res, callback){
    	
    	// set local variables
    	res.locals.user = req.user;
    	res.locals.roles = User.ROLES;
    	res.locals.url = req.url.toString();
    	res.locals.imagePath = public_image_path;
    	
        if(req.user){
        	
        	// set local variables
        	res.locals.user = req.user;        	
            if(req.url.toString() != "/")
                callback(req, res);
            else
                res.redirect('/user');

        }else{
        	
            if(req.url.toString() == "/")
                callback(req, res);
            else
                res.redirect('/');

        }
        
    }
    
    // Function for API key authentication(Android, IOS, Server and Browser)
    function apiKeyAuth(req, res, callback){

		var apiKey = req.get("Authorization"),
			verifier = req.get("Verifier"),
			version =  req.get("Version");
		
		// Ccheck verifier since old version sdk not include
		if(verifier) {

			checkSdkVersion(version, function(result){

				if( result ) {

					DeveloperApplication.findOne({

						apiKey: apiKey,
						verifier: verifier
					
					}, function(err, devApp){
						
						if(err)
							log.error(err);
						
						if(devApp) {

							User.findById( devApp.userId, function(err, user){

								if(err)
									log.error(err);

								if(user){

					    			req.user = user;
					    			callback(req, res);
								
								}else{
									
									res.json(401, { 
										msg: "Unavailable api key or verifier" 
									});	
									
								}

							});

						} else {

							res.json(401, { 
								msg: "Unavailable api key or verifier" 
							});

						}

					});

				} else {

					res.json(401, { 
						msg: "Sdk version is too old, please update to latest one" 
					});	

				}

			});

		} else {

			res.json(401, { 
				msg: "Sdk version is too old, please update to latest one" 
			});	

		}

	}

    // Function about token authentication
    function tokenAuth(req, res, callback){
    	
		var token = req.get("Authorization");
		User.findOne({
			token: token
		}, function(err, user){
			if(err)
				log.error(err);
			
			if(user){
    			req.user = user;
    			callback(req, res);
			}else{
				
				res.json(401, { 
					msg: "Unavailable token" 
				});
				
			}
		});    	
    	
    }
    
    // Function about cookie token(remember me) authentication
    function cookieTokenAuth(req, res, callback){
    	
    	// set local variables
    	res.locals.user = req.user;
    	res.locals.roles = User.ROLES;
    	res.locals.url = req.url.toString();
    	res.locals.imagePath = public_image_path;
    	
    	// Get cookie token
		var cookieToken = req.cookies.cookieToken;
		CookieToken.findOne({
			
			token: cookieToken
			
		}, function(err, ct){
			
			if(err)
				log.error(err);
			
			if(ct){
    			
				// Get user
				User.findById(ct.userId, function(err, user){
					
					if(err)
						log.error(err);
					
					if(user){
						
			        	// Set req.user and local variables
						req.user = user;
			        	res.locals.user = req.user;        	
			            if(req.url.toString() != "/")
			                callback(req, res);
			            else
			                res.redirect('/user');
			            
					}
					
				});
    			
			}else{
				
	            if(req.url.toString() == "/")
	                callback(req, res);
	            else
	                res.redirect('/');
				
			}
		});  	
    	
    }
    
    // Configure secure get
    app.sget = function(url, callback) {
        app.get(url, function(req, res){                    	        	
			
			// Setup local variables        	
			res.locals.domainUrl = config.domainUrl;

        	// Check authentication way
        	if(req.get("Authorization"))
        		apiKeyAuth(req, res, callback);
        	//else if(req.get("Authorization"))        		
        	//	tokenAuth(req, res, callback);
        	else if(req.cookies.cookieToken)
        		cookieTokenAuth(req, res, callback);        	
        	else        	        	
        		isLoggedIn(req, res, callback);            
        });
    };

    // Configure secure post
    app.spost = function(url, callback) {
        app.post(url, function(req, res){

			// Setup local variables        	
			res.locals.domainUrl = config.domainUrl;
        	
        	// Check authentication way
        	if(req.get("Authorization"))
        		apiKeyAuth(req, res, callback);
        	//else if(req.get("Authorization"))        		
        	//	tokenAuth(req, res, callback);        		
        	else if(req.cookies.cookieToken)
        		cookieTokenAuth(req, res, callback);
        	else        	        	
        		isLoggedIn(req, res, callback);  
        });
    };

    return app;
    
};


// Function for check sdk version
function checkSdkVersion(version, next) {

	if(version) {

		SdkGlobalVersion.findOne({}, function(err, sgv){

			if(err) {

				log.error(err);
				next(false);

			} else {

				var temp = version.split(";"),
					type = temp[0],
					ver = temp[1];

				if(type == "android") {

					if(ver >= sgv.android)
						next(true);
					else	
						next(false);

				} else if (type == "ios") {

					if(ver >= sgv.ios)
						next(true);
					else	
						next(false);

				}	

			}

		});

	} else {

		next(false);

	}

}

log.info("Finish passport setup");

module.exports = passport;