var passport = require('passport'),
	facebookStrategy = require('passport-facebook').Strategy,
	localStrategy = require('passport-local').Strategy,
	log = require('log4js').getLogger(),
	User = require('../model/user');


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
		
	}, function(error, user){
		
		if (user) {

			log.info(user);
			return done(null, user);

		} else {

			return done(null, false, {
				message : 'Incorrect username or password!!'
			});

		}		
		
	});

}));

// Passport Ffacebook OAuth configuration
passport.use(new facebookStrategy({

	clientID : "138521589682299",
	clientSecret : "c95dd1966614afc48129a5405b96dd79",
	callbackURL : "/auth/facebook/callback"

}, function(accessToken, refreshToken, profile, done) {

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
			user.accessToken = accessToken;
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
					done(err, newUser);

				} else {

					log.info('Failed to create new user ' + profile.username);
					return done(null, false, { message : 'Server error, fail to create new user ' + profile.username });

				}				
			});

		}		
		
	});

}));

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
        	
            if(req.url.toString() == "/login" || req.url.toString() == "/")
                callback(req, res);
            else
                res.redirect('/login');

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

    // Configure secure get
    app.sget = function(url, callback) {
        app.get(url, function(req, res){                    	
        	// Check authentication way
        	if(req.get("Authorization"))        		
        		tokenAuth(req, res, callback);        		
        	else        	        	
        		isLoggedIn(req, res, callback);            
        });
    };

    // Configure secure post
    app.spost = function(url, callback) {
        app.post(url, function(req, res){
        	// Check authentication way
        	if(req.get("Authorization"))        		
        		tokenAuth(req, res, callback);        		
        	else        	        	
        		isLoggedIn(req, res, callback);  
        });
    };

    return app;
    
};

log.info("Finish passport setup");

module.exports = passport;