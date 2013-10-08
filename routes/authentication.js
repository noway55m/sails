var passport = require('passport');

// Get Login page
exports.index = function(req, res){
	console.log(req.query)
	console.log(req.query.name)
	
    res.render('login.html', {
    	url: req.url.toString(), // use in layout for identify display info
    	errorMsg: req.flash('error') || ""
    });
};


// POST Interface for authenticate user by username and password (Web Browser)
exports.auth = passport.authenticate('local', {
    successRedirect : '/user',
    failureRedirect : '/login',
    failureFlash: true
});


// POST Interface for authenticate user by username and password (Mobile)
exports.authMobile = function(req, res, next){	
	passport.authenticate('local', function(err, user, info) {

	    if (err) 
	    	return next(err);
	    
	    if (!user) {
	    	
	    	return res.json(401, info);
	    	
	    }else{
	        
	    	req.logIn(user, function(err) {
	            if (err)
	            	return next(err);
	            
	            return res.json(200, user);
	        });
	    	
	    }
	    
	})(req, res, next);		
};

// GET Interface for logout 
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};
