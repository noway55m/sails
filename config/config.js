
var configuration = {

	domainUrl : "https://cloud.sailstech.com",

	/******** Main resource folder  ********/		
	resourcePath : "./resource/",

	/******** Folder path of Building and floor files  ********/
	imagePath : "public/client-image",
	
	mapInfoPath: "resource/map-info",

	mapInfoResourcePath: "resource", // ${mapInfoPath}/${USER_ID}/${mapInfoResourcePath}

	/******** Download sdk, online doc and sample code path ********/

	sailsResPath: "resource/sails-relative-res",

	androidDocPath: "resource/sails-relative-res/android/Javadoc.rar",		

	iosDocPath: "resource/sails-relative-res/ios/doc.rar",		
		
	defaultAndroidSdkVersion: 1.2,

	defaultIosSdkVersion: 1.2,

	/******** Main sample building folder  ********/		
	sampleBuildingPath: "resource/map-info/Sample",

	/******** Default cookie duration ********/		
	defaultCookieDuration: 604800, // 7 days: 604800 <=> 60 * 60 * 24 * 7

	/******** Default token duration ********/	
	defaultTokenDuration: 86400, // 1 day: 86400 <=> 60 * 60 * 24
	
	/******** Max number of building count ********/	
	maxBuildingNumberOfUser: 50, 
	
	/******** Max number of floor count ********/	
	maxFloorNumber: 100,
	maxBasementNumber: 20,

	/******** Pagination offset per page ********/	
	pageOffset: 30,

	/******** Recaptcha public and private key ********/
	recaptchaPublicKey: "6Lco-u0SAAAAAM_vZInahzRKgLZMmHN_zJII7QU5",

	recaptchaPrivateKey: "6Lco-u0SAAAAAASO_2mDmdc4aaHP2p4jFBa6hhZ9",

	/******** Maximum upload size ********/
	maximumUploadSize: 6000000, // bytes
					   
	/******** Sample building name ********/
	sampleBuildingName: "MyHome",

	/******** Develop environment ********/
	dev: {

		domainUrl : "https://chewinggun.net",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR",

		/******** Google Analystic Relative ********/	
		gaAccountId: "UA-50387624-1", // chewinggun.net - frank.hsu

	},

	/******** Test environment ********/
	test: {

		domainUrl : "https://54.250.229.230",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR",

		/******** Google Analystic Relative ********/	
		gaAccountId: "UA-28254038-2", // chewinggun.net - frank.hsu

	},

	/******** Production environment ********/
	prod: {

		domainUrl : "https://cloud.sailstech.com",

		/******** AppId and AppSecret of Facebook, twitter and google+ ********/	
		facebookAppKey: "191009537749511",
		
		facebookAppSecret: "bd632d3cae63b4ad4314a7238dd2aa19",
		
		twitterAppKey: "T9Ovg7MAiehY4XUPTfZzw",
		
		twitterAppSecret: "zcB3JUdQlCslW7546OdropON116vENwx84E0K8bloI",
		
		googleAppKey: "369163861143.apps.googleusercontent.com",
		
		googleAppSecret: "GjyzGopNhamfve2Ouhw9firR",

		/******** Google Analystic Relative ********/	
		gaAccountId: "UA-47307984-1", // cloud.sailtech.com

	}

}





// Get enviroment argument
console.log("Configuration get current config env: " + process.CONFIG_ENV);
var env = process.CONFIG_ENV;	

// Get utility config
var returnConfig = {};
for(var key in configuration) {
	if( key!="dev" && key!="test" && key!="prod")		
		returnConfig[key] = configuration[key];
}

// Get utility config (default prod)
if(env == "dev") {

	for( var key2 in configuration["dev"])
		returnConfig[key2] = configuration["dev"][key2];

} else if(env == "test") {

	for( var key2 in configuration["test"])
		returnConfig[key2] = configuration["test"][key2];

} else {

	for( var key2 in configuration["prod"])
		returnConfig[key2] = configuration["prod"][key2];

}

console.log("----------------- CONFIG " + env + "-----------------");
console.log(returnConfig);
console.log("----------------- CONFIG " + env + "-----------------");

module.exports = returnConfig;
