
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , authentication = require('./routes/authentication')
  , register = require('./routes/register')
  , UserModel = require('./model/user')
  , user = require('./routes/user')
  , building = require('./routes/building')  
  , floor = require('./routes/floor')
  , store = require('./routes/store')
  , ad = require('./routes/ad')  
  , ap = require('./routes/ap')
  , iD = require('./routes/iD')
  , others = require('./routes/others')    
  , http = require('http')
  , https = require('https')
  , httpProxy = require('http-proxy')
  , path = require('path')
  , passport = require('./config/passportSetup')
  , bootstrap = require('./config/bootstrap')
  , flash = require('connect-flash')
  , log4js = require('log4js')
  , buildingAdmin = require('./routes/admin/buildingAdmin')
  , resourceAdmin = require('./routes/admin/resourceAdmin')
  , userAdmin = require('./routes/admin/userAdmin')
  , config = require('./config/config.js');


var app = express();

// Connect data source
require('./model/dataSource');

// Cookies and session setup
app.use(express.cookieParser());
app.use(express.session({ secret: 'salisabcdefghijksails' }));
app.use(flash());

// Passport setup for user authentication
app.use(passport.initialize());
app.use(passport.session());

// Support html by nodejs module "ejs"
app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'resource/tmp'}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sails-resource/download/doc/android', express.static(path.join(__dirname, '/resource/sails-relative-res/android/doc')));
app.use('/sails-resource/download/doc/ios', express.static(path.join(__dirname, '/resource/sails-relative-res/ios/doc')));


// Support html by nodejs module "ejs"
app.engine('html', require('ejs').renderFile);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Configure secured http request
app = passport.configSecureHttpRequest(app);

/**************** URL Mapping ****************/
app.sget('/', authentication.index); // app.sget('/login', authentication.index);
app.sget('/logout', authentication.logout);
app.post('/auth', authentication.auth);
app.post('/authMobile', authentication.authMobile);
app.get('/register', register.index);
app.post('/register/auth', register.auth);
app.get('/register/activate/:token', register.activate);

//---------------------------------
app.sget('/user', user.index);
app.sget('/user/profile', user.profile);
app.sget('/user/read/:_id', user.read);
app.post('/user/forgetPassword', user.forgetPassword);
app.spost('/user/changePassword', user.changePassword);
app.get('/user/resetPassword/:token', user.resetPassword);
app.post('/user/resetPasswordAuth', user.resetPasswordAuth);
app.post('/user/upgradeDeveloper', user.upgradeDeveloper);


//----------------------------------
app.sget('/building/show/:_id', building.show);
app.sget('/building/read/:_id', building.read);
app.spost('/building/create', building.create);
app.spost('/building/update', building.update);
app.spost('/building/delete', building.del);
app.sget('/building/list', building.list);
app.sget('/building/listPage', building.listPage);
app.sget('/building/list/public', building.listPublic);
app.spost('/building/uploadImage', building.uploadImage);
app.spost('/building/packageMapzip', building.packageMapzip);
app.sget('/building/getMapzip', building.getMapzip);
app.spost('/building/uploadBeaconlist', building.uploadBeaconlist);

//----------------------------------
app.sget('/floor/show/:_id', floor.show);
app.sget('/floor/read/:_id', floor.read);
app.sget('/floor/list', floor.list);
app.spost('/floor/create', floor.create);
app.spost('/floor/update', floor.update);
app.spost('/floor/uploadMapAndPath', floor.uploadMapAndPath);
app.spost('/floor/uploadRenderAndRegion', floor.uploadRenderAndRegion);
app.spost('/floor/uploadAplist', floor.uploadAplist);
app.spost('/floor/uploadMapzip', floor.uploadMapzip);
app.spost('/floor/uploadMap', floor.uploadMap);
app.spost('/floor/uploadPath', floor.uploadPath);
app.spost('/floor/uploadRender', floor.uploadRender);
app.spost('/floor/uploadRegion', floor.uploadRegion);
app.sget('/floor/getMap', floor.getFile);
app.sget('/floor/getPath', floor.getFile);
app.sget('/floor/getRender', floor.getFile);
app.sget('/floor/getRegion', floor.getFile);
app.sget('/floor/getMapzip', floor.getMapzip);
app.spost('/floor/delete', floor.del);


//----------------------------------
app.sget('/store/show/:_id', store.show);
app.sget('/store/read/:_id', store.read);
app.sget('/store/list', store.list);
app.spost('/store/create', store.create);
app.spost('/store/update', store.update);
app.spost('/store/uploadImage', store.uploadImage);
app.spost('/store/delete', store.del);

//----------------------------------
app.sget('/ad/show/:_id', ad.show);
app.sget('/ad/read/:_id', ad.read);
app.sget('/ad/list', ad.list);
app.spost('/ad/create', ad.create);
app.spost('/ad/update', ad.update);
app.spost('/ad/uploadImage', ad.uploadImage);
app.spost('/ad/delete', ad.del);

//-----------------------------------
app.sget('/ap/queryBuildingAndFloor', ap.queryBuildingAndFloor);


//-----------------------------------
app.post('/iD/update', iD.update);




//-----------------------------------
app.sget('/sails-resource/download', others.download);
app.sget('/sails-resource/download/sdk/:platform/:fileName', others.downloadSdk);
app.sget('/sails-resource/download/sample-code/:platform/:fileName', others.downloadSampleCode);
function ensureAuthenticated(req, res, next) {
  if (req.path === '/' || req.user) {
    return next();
  }
  res.redirect('/')
}
app.get('/sails-resource/download/doc/android/*', ensureAuthenticated, function(req, res, next) {
  next();
});
app.get('/sails-resource/download/doc/ios/*', ensureAuthenticated, function(req, res, next) {
  next();
});


//------------------------------ admin page and interface (only use in admin)

// Function for check user role is admin
function isAdmin(req, res, next) {

  console.log("funtion isAdmin---------------------------------------------");

  // set local variables
  res.locals.user = req.user;
  res.locals.roles = UserModel.ROLES;
  res.locals.url = req.url.toString();
  res.locals.imagePath = "client-image";

  if (req.path === '/' || ( req.user && req.user.role == UserModel.ROLES.ADMIN ) ) {
    res.locals.user = req.user;
    return next();
  }
  res.redirect('/')
}

// Admin building interfaces
app.get('/admin/building/list', isAdmin,  buildingAdmin.list); // only use in admin
app.get('/admin/building/show/:_id', isAdmin,  buildingAdmin.show); // only use in admin


// Admin resource interfaces
app.get('/admin/resource/sdk/index', isAdmin, resourceAdmin.sdkIndex);
app.get('/admin/resource/sdk/list', isAdmin, resourceAdmin.sdkList); 
app.post('/admin/resource/sdk/create', isAdmin, resourceAdmin.sdkCreate);
app.post('/admin/resource/sdk/update', isAdmin, resourceAdmin.sdkUpdate);
app.post('/admin/resource/sdk/delete', isAdmin, resourceAdmin.sdkDelete);
app.post('/admin/resource/sdk/uploadSdkAndSampleCode', isAdmin, resourceAdmin.uploadSdkAndSampleCode); 
app.post('/admin/resource/sdk/uploadSdk', isAdmin, resourceAdmin.uploadSdk); 
app.post('/admin/resource/sdk/uploadSampleCode', isAdmin, resourceAdmin.uploadSampleCode); 

// Admin user interfaces
app.get('/admin/user/index', isAdmin,  userAdmin.index); 
app.get('/admin/user/list', isAdmin, userAdmin.list); 
app.post('/admin/user/create', isAdmin, userAdmin.create);
app.post('/admin/user/update', isAdmin, userAdmin.update);
app.post('/admin/user/delete', isAdmin, userAdmin.del);
app.post('/admin/user/changePassword', isAdmin, userAdmin.changePassword);


/**************** Social URL Mapping ****************/
// Facebook OAuth Authentication
app.get('/auth/facebook',passport.authenticate('facebook', {
	scope: ['read_stream', 'publish_actions', 'read_friendlists', 'manage_notifications']
}) );

// Facebook OAuth Code Callback (first handshake)
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/user', failureRedirect: '/' }) );

//-----------------------------------------------
// Twitter OAuth Authentication
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter OAuth Code Callback (first handshake)
app.get('/auth/twitter/callback',  passport.authenticate('twitter', { successRedirect: '/user', failureRedirect: '/' }));

//-----------------------------------------------
// Google Plus OAuth Authentication
app.get('/auth/google', passport.authenticate('google', {
	scope: ['https://www.googleapis.com/auth/plus.login']
}));

// Google Plus OAuth Code Callback (first handshake)
app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/' }) ,function(req, res){
	res.redirect('/user');
});


/**************** Create HTTP Server ****************/
// Create your proxy server
httpProxy.createServer(app.get('port'), 'localhost').listen(80);

// Create http server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/**************** Bootstrap ****************/
bootstrap();
