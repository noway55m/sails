// Get environment
console.log("Set env: " + process.argv)
if(process.argv.length >=3)
  process.CONFIG_ENV = process.argv[2] || "prod";

/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , fs = require('fs')
  , customFilter = require('./routes/customFilter')
  , authentication = require('./routes/authentication')
  , register = require('./routes/register')
  , UserModel = require('./model/user')
  , user = require('./routes/user')
  , poi = require('./routes/poi')    
  , building = require('./routes/building')  
  , floor = require('./routes/floor')
  , store = require('./routes/store')
  , ad = require('./routes/ad')  
  , ap = require('./routes/ap')
  , iD = require('./routes/iD')
  , developer = require('./routes/developer')    
  , sdk = require('./routes/sdk')  
  , feedback = require('./routes/feedback') 
  , others = require('./routes/others')
  , iBeaconDevice = require('./routes/iBeaconDevice')
  , geofence = require('./routes/geofence')
  , coupon = require('./routes/coupon')  
  , indoorLocationRecord = require('./routes/indoorLocationRecord')
  , mobileDevice = require('./routes/mobileDevice')  
  , errorHandler = require('./routes/errorHandler')      
  , http = require('http')
  , https = require('https')
  , httpProxy = require('http-proxy')
  , path = require('path')
  , passport = require('./config/passportSetup')
  , bootstrap = require('./config/bootstrap')
  , flash = require('connect-flash')
  , log4js = require('log4js')
  , buildingAdmin = require('./routes/admin/buildingAdmin')
  , floorAdmin = require('./routes/admin/floorAdmin') 
  , storeAdmin = require('./routes/admin/storeAdmin')
  , adAdmin = require('./routes/admin/adAdmin')      
  , resourceAdmin = require('./routes/admin/resourceAdmin')
  , userAdmin = require('./routes/admin/userAdmin')
  , feedbackAdmin = require('./routes/admin/feedbackAdmin')
  , notificationAdmin = require('./routes/admin/notificationAdmin')
  , config = require('./config/config.js')
  , i18n = require("i18n");

// Set events size
var events = require('events');
events.EventEmitter.defaultMaxListeners = 100;


var app = express();

// i18n setup
i18n.configure({

    // you may alter a site wide default locale
    defaultLocale: 'en',

    // Support locales  
    locales:['en', 'zh_tw', "zh_cn"],

    // Folder
    directory: './locales',

    // Enable object notation 
    objectNotation: true

});
app.use(i18n.init);


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

// Set all config and set roles to global variables
app.locals.config = config;
app.locals.roles = UserModel.ROLES;

// Custom  Error Handler
app.use(errorHandler.error500);
app.use(errorHandler.error404);

// Force use all get use https
app.get('*',function(req,res,next){
  if(req.protocol !='https'){
    res.redirect( config.domainUrl + req.url)
  }else{
    next() /* Continue to other routes if we're not redirecting */
  }
});

// Set locale
app.get('*', function(req,res,next){
  customFilter.setLocaleF(req, res);
  next();
});

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

app.get('/setLocale', customFilter.setLocale);

//---------------------------------
app.sget('/user', user.index);
app.sget('/user/profile', user.profile);
app.sget('/user/read/:_id', user.read);
app.post('/user/forgetPassword', user.forgetPassword);
app.spost('/user/changePassword', user.changePassword);
app.get('/user/resetPassword/:token', user.resetPassword);
app.post('/user/resetPasswordAuth', user.resetPasswordAuth);
app.post('/user/upgradeDeveloper', user.upgradeDeveloper);
app.get('/user/poiTags', user.getPoiTags);

//----------------------------------
app.sget('/poi/show/:_id', poi.show);
app.sget('/poi/read/:_id', poi.read);
app.spost('/poi/create', poi.create);
app.spost('/poi/update', poi.update);
app.spost('/poi/delete', poi.del);
app.sget('/poi/list', poi.list);
app.spost('/poi/uploadFile', poi.uploadFile);
app.spost('/poi/copy', poi.copy);
app.spost('/poi/copyTemplate', poi.copyTemplate);
app.sget('/poi/getCopies', poi.getCopies);
app.sget('/poi/getCopyTemplates', poi.getCopyTemplates);
app.spost('/poi/removeCopy', poi.removeCopy);
app.spost('/poi/removeCopyTemplate', poi.removeCopyTemplate);
app.sget('/poi/getFile', poi.getFile);
app.get('/poi/search', poi.search);

app.sget('/poi/event/index', poi.indexEvent);
app.sget('/poi/event/list', poi.listEvent);
app.spost('/poi/event/create', poi.createEvent);
app.spost('/poi/event/update', poi.updateEvent);
app.spost('/poi/event/delete', poi.deleteEvent);


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
app.spost('/floor/uploadBtlezip', floor.uploadBtlezip);

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

//--------------------------
app.get('/feedback/index', feedback.index);
app.post('/feedback/create', feedback.create);


//--------------------------
app.sget('/developer/app', developer.appIndex);
app.sget('/developer/app/list', developer.appList);
app.spost('/developer/app/create', developer.appCreate);
app.spost('/developer/app/update', developer.appUpdate);
app.spost('/developer/app/delete', developer.appDelete);
app.spost('/developer/app/regenerateKey', developer.appRegenerateKey);


//-----------------------------------
app.get('/terms', others.terms);
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


//--------------------------
app.sget('/iBeaconDevice/read/:deviceUid', iBeaconDevice.read);
app.sget('/iBeaconDevice/list', iBeaconDevice.list);
app.spost('/iBeaconDevice/create', iBeaconDevice.create);
app.spost('/iBeaconDevice/update', iBeaconDevice.update);
app.spost('/iBeaconDevice/bindCoupons', iBeaconDevice.bindCoupons);
app.spost('/iBeaconDevice/delete', iBeaconDevice.del);

//--------------------------
app.sget('/geofence/read/:_id', geofence.read);
app.sget('/geofence/list', geofence.list);
app.spost('/geofence/create', geofence.create);
app.spost('/geofence/update', geofence.update);
app.spost('/geofence/bindCoupons', geofence.bindCoupons);
app.spost('/geofence/delete', geofence.del);

//--------------------------
app.sget('/coupon/read/:_id', coupon.read);
app.sget('/coupon/list', coupon.list);
app.spost('/coupon/create', coupon.create);
app.spost('/coupon/update', coupon.update);
app.spost('/coupon/delete', coupon.del);


//--------------------------
app.sget('/mobileDevice/read/:mdUid', mobileDevice.read);
app.post('/mobileDevice/create', mobileDevice.create);
app.post('/mobileDevice/delete', mobileDevice.del);

//--------------------------
app.get('/indoorLocationRecord/list', indoorLocationRecord.list);
app.post('/indoorLocationRecord/upload', indoorLocationRecord.upload);


//--------------------------
app.get('/sdk/globalVersion/read', sdk.getGlobalVersion);

//------------------------------ admin page and interface (only use in admin)

// Function for check user role is admin
function isAdmin(req, res, next) {

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
app.get('/admin/building/index', isAdmin,  buildingAdmin.index); // only use in admin
app.get('/admin/building/show/:_id', isAdmin,  buildingAdmin.show); // only use in admin
app.get('/admin/building/read/:_id', isAdmin, buildingAdmin.read);
app.post('/admin/building/create', isAdmin, buildingAdmin.create);
app.post('/admin/building/update', isAdmin, buildingAdmin.update);
app.post('/admin/building/delete', isAdmin, buildingAdmin.del);
app.get('/admin/building/list', isAdmin, buildingAdmin.list);
//app.get('/admin/building/list/public', isAdmin, buildingAdmin.listPublic);
app.post('/admin/building/uploadImage', isAdmin, buildingAdmin.uploadImage);
app.post('/admin/building/packageMapzip', isAdmin, buildingAdmin.packageMapzip);
app.get('/admin/building/getMapzip', isAdmin, buildingAdmin.getMapzip);
app.post('/admin/building/uploadBeaconlist', isAdmin, buildingAdmin.uploadBeaconlist);
app.get('/admin/building/searchIndex', isAdmin, buildingAdmin.searchIndex);
app.get('/admin/building/search', isAdmin, buildingAdmin.search);


// Admin floor interfaces
app.get('/admin/floor/list', isAdmin, floorAdmin.list);
app.get('/admin/floor/show/:_id', isAdmin, floorAdmin.show);
app.get('/admin/floor/read/:_id', isAdmin, floorAdmin.read);
app.post('/admin/floor/create', isAdmin, floorAdmin.create);
app.post('/admin/floor/update', isAdmin, floorAdmin.update);
app.post('/admin/floor/delete', isAdmin, floorAdmin.del);
app.post('/admin/floor/uploadAplist', isAdmin, floorAdmin.uploadAplist);
app.post('/admin/floor/uploadMapzip', isAdmin, floorAdmin.uploadMapzip);
app.post('/admin/floor/uploadMap', isAdmin, floorAdmin.uploadMap);
app.post('/admin/floor/uploadPath', isAdmin, floorAdmin.uploadPath);
app.post('/admin/floor/uploadRender', isAdmin, floorAdmin.uploadRender);
app.post('/admin/floor/uploadRegion', isAdmin, floorAdmin.uploadRegion);
app.get('/admin/floor/getMap', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getPath', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getRender', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getRegion', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getAplist', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getMapzip', isAdmin, floorAdmin.getFile);
app.get('/admin/floor/getBtlezip', isAdmin, floorAdmin.getFile);
app.post('/admin/floor/uploadBtlezip', isAdmin, floorAdmin.uploadBtlezip);

// Admin store interfaces
app.get('/admin/store/list', isAdmin, storeAdmin.list);
app.get('/admin/store/show/:_id', isAdmin, storeAdmin.show);
app.get('/admin/store/read/:_id', isAdmin, storeAdmin.read);
app.post('/admin/store/create', isAdmin, storeAdmin.create);
app.post('/admin/store/update', isAdmin, storeAdmin.update);
app.post('/admin/store/delete', isAdmin, storeAdmin.del);
app.post('/admin/store/uploadImage', isAdmin, storeAdmin.uploadImage);


// Admin ad interfaces
app.get('/admin/ad/list', isAdmin, adAdmin.list);
app.get('/admin/ad/show/:_id', isAdmin, adAdmin.show);
app.get('/admin/ad/read/:_id', isAdmin, adAdmin.read);
app.post('/admin/ad/create', isAdmin, adAdmin.create);
app.post('/admin/ad/update', isAdmin, adAdmin.update);
app.post('/admin/ad/delete', isAdmin, adAdmin.del);
app.post('/admin/ad/uploadImage', isAdmin, adAdmin.uploadImage);


// Admin resource interfaces
app.get('/admin/resource/sdk/index', isAdmin, resourceAdmin.sdkIndex);
app.get('/admin/resource/sdk/list', isAdmin, resourceAdmin.sdkList); 
app.post('/admin/resource/sdk/create', isAdmin, resourceAdmin.sdkCreate);
app.post('/admin/resource/sdk/update', isAdmin, resourceAdmin.sdkUpdate);
app.post('/admin/resource/sdk/delete', isAdmin, resourceAdmin.sdkDelete);
app.post('/admin/resource/sdk/uploadSdkAndSampleCode', isAdmin, resourceAdmin.uploadSdkAndSampleCode); 
app.post('/admin/resource/sdk/uploadSdk', isAdmin, resourceAdmin.uploadSdk); 
app.post('/admin/resource/sdk/uploadSampleCode', isAdmin, resourceAdmin.uploadSampleCode); 
app.get('/admin/resource/sdk/sdkGlobalVersionIndex', isAdmin, resourceAdmin.sdkGlobalVersionIndex);

app.get('/admin/resource/sdk/globalVersion/read', isAdmin, resourceAdmin.getGlobalVersion);
app.post('/admin/resource/sdk/globalVersion/update', isAdmin, resourceAdmin.updateGlobalVersion);


// Admin user interfaces
app.get('/admin/user/index', isAdmin,  userAdmin.index); 
app.get('/admin/user/list', isAdmin, userAdmin.list); 
app.post('/admin/user/create', isAdmin, userAdmin.create);
app.post('/admin/user/update', isAdmin, userAdmin.update);
app.post('/admin/user/delete', isAdmin, userAdmin.del);
app.post('/admin/user/changePassword', isAdmin, userAdmin.changePassword);
app.get('/admin/user/findByUsername', isAdmin, userAdmin.findByUsername);
app.get('/admin/user/searchIndex', isAdmin, userAdmin.searchIndex);
app.get('/admin/user/search', isAdmin, userAdmin.search);


// Admin feedback interfaces
app.get('/admin/feedback/index', isAdmin,  feedbackAdmin.index);
app.get('/admin/feedback/list', isAdmin, feedbackAdmin.list); 


// Admin notification interfaces
app.get('/admin/notification/email', isAdmin,  notificationAdmin.email);
app.post('/admin/notification/emailSend', isAdmin,  notificationAdmin.emailSend);


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

// Create http server
var options = {
  key: fs.readFileSync("./config/keys/sails.key"),
  cert: fs.readFileSync("./config/keys/sails.cert"),
  passphrase: process.argv[3]
}
https.createServer(options, app).listen(443, function(){
  console.log('Express server listening on port 443');
});



/**************** Bootstrap ****************/
bootstrap();



/**************** Schedule job using cron library ****************/
// var cronJob = require('cron').CronJob;
// new cronJob('3 * * * * *', function(){
//     console.log('You will see this message every second');
// }, null, true, "America/Los_Angeles");
