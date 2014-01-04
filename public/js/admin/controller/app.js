// Include all service in app
var app = angular.module('sails-admin', ['ngResource', 'buildingServices', 'floorServices', 
                                   'storeServices', 'adServices', 'userServices', 'sdkServices']);

// REST API of Building
angular.module('buildingServices', [ 'ngResource' ]).factory('Building', function($resource) {
    return $resource('/building/:action/:_id', { _id : "@id"}, {

        get : {
            method : 'GET',
            params : {
                action : 'read'
            }
        },
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },
        list : {
            method : 'GET',
            params : {
                action : 'listPage',
                page: 1
            }
        },
        packageMapzip : {
            method : 'POST',
            params : {
                action : 'packageMapzip'
            }
        }                
    });
});

// REST API of Floor
angular.module('floorServices', [ 'ngResource' ]).factory('Floor', function($resource) {
    return $resource('/floor/:action/:_id', { _id : "@id" }, {
        get : {
            method : 'GET',
            params : {
                action : 'read'
            }
        },
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },
        list : {
            method : 'GET',
            params : {
                action : 'list'
            },
            isArray : true
        }
    });

});


// REST API of Store
angular.module('storeServices', [ 'ngResource' ]).factory('Store', function($resource) {
    return $resource('/store/:action/:_id', { _id : "@id" }, {
        get : {
            method : 'GET',
            params : {
                action : 'read'
            }
        },
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },
        list : {
            method : 'GET',
            params : {
                action : 'list'
            },
            isArray : true
        }
    });
});


// REST API of Ad
angular.module('adServices', [ 'ngResource' ]).factory('Ad', function($resource) {
    return $resource('/ad/:action/:_id', { _id : "@id" }, {
        get : {
            method : 'GET',
            params : {
                action : 'read'
            }
        },
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },
        list : {
            method : 'GET',
            params : {
                action : 'list'
            },
            isArray : true
        }
    });
});

// REST API of User
angular.module('userServices', [ 'ngResource' ]).factory('User', function($resource) {
    return $resource('/user/:action/:_id', { _id : "@id" }, {
        get : {
            method : 'GET',
            params : {
                action : 'read'
            }
        },
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },
        list : {
            method : 'GET',
            params : {
                action : 'list'
            },
            isArray : true
        },
        changePassword : {
            method : 'POST',
            params : {
                action : 'changePassword'
            }        	
        },
        changePasswordAdmin : {
            method : 'POST',
            params : {
                action : 'changePasswordAdmin'
            }        	
        },
        upgradeDeveloper : {
            method : 'POST',
            params : {
                action : 'upgradeDeveloper'
            }        	
        }            
    });
});


// REST API of Sdk
angular.module('sdkServices', [ 'ngResource' ]).factory('Sdk', function($resource) {
    return $resource('/resource/admin/sdk/:action/:_id', { _id : "@id" }, {        
        create : {
            method : 'POST',
            params : {
                action : 'create'
            }
        },
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },        
        "delete" : {
            method : 'POST',
            params : {
                action : 'delete'
            }
        },      
        list : {
            method : 'GET',
            params : {
                action : 'list'
            }
        }          
    });
});