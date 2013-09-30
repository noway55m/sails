
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , authentication = require('./routes/authentication')
  , register = require('./routes/register')
  , user = require('./routes/user')
  , building = require('./routes/building')
  , floor = require('./routes/floor')
  , store = require('./routes/store')
  , ad = require('./routes/ad')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , passport = require('./config/passportSetup')
  , bootstrap = require('./config/bootstrap')
  , flash = require('connect-flash');


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

// Support html by nodejs module "ejs"
app.engine('html', require('ejs').renderFile);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Configure secured http request
app = passport.configSecureHttpRequest(app);

// URL mapping
app.sget('/', routes.index);
app.sget('/login', authentication.index);
app.sget('/logout', authentication.logout);
app.post('/auth', authentication.auth);
app.sget('/user', user.index);
app.get('/register', register.index);
app.post('/register/auth', register.auth);

app.sget('/user/building/show/:id', building.index);
app.sget('/user/building/read/:id', building.read);
app.spost('/user/building/create', building.create);
app.spost('/user/building/update', building.update);
app.spost('/user/building/delete', building.del);
app.sget('/user/building/list', building.list);

app.spost('/user/building/uploadMapzip', building.uploadMapzip);
app.spost('/user/building/uploadImage', building.uploadImage);

app.sget('/building/map/:filename', building.getMapzip);

//----------------------------------
app.sget('/user/floor/read/:id', floor.read);
app.sget('/user/floor/list', floor.list);
app.spost('/user/floor/create', floor.create);
app.spost('/user/floor/update', floor.update);

//----------------------------------
app.sget('/user/store/show/:id', store.index);
app.sget('/user/store/read/:id', store.read);
app.sget('/user/store/list', store.list);
app.spost('/user/store/create', store.create);
app.spost('/user/store/update', store.update);
app.spost('/user/store/uploadImage', store.uploadImage);

//----------------------------------

app.sget('/user/ad/list', ad.list);
app.spost('/user/ad/create', ad.create);
app.spost('/user/ad/update', ad.update);
app.spost('/user/ad/uploadImage', ad.uploadImage);
//----------------------------------



// Facebook OAuth Authentication
app.get('/auth/facebook',passport.authenticate('facebook', {
	scope: ['read_stream', 'publish_actions', 'read_friendlists', 'manage_notifications']
}) );

// Facebook OAuth Code Callback (first handshake)
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/user', failureRedirect: '/login' }) );


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Execute pre-process step
bootstrap();

console.log('test');