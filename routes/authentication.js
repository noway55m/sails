var passport = require('passport');

/*
 * Get Login page
 */
exports.index = function(req, res){
	console.log(req.query)
	console.log(req.query.name)
	
    res.render('login.html', {
    	url: req.url.toString(), // use in layout for identify display info
    	errorMsg: req.flash('error') || ""
    });
};


/*
* POST Interface for username and password authentication
*/
exports.auth = passport.authenticate('local', {
    successRedirect : '/user',
    failureRedirect : '/login',
    failureFlash: true
});

/*
* GET Interface for logout
*/
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
};
