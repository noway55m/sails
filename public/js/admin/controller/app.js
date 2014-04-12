// Include all service in app
var app = angular.module('sails-admin', ['ngResource', 'buildingServices', 'floorServices', 
                                   'storeServices', 'adServices', 'userServices', 'sdkServices',
                                   'feedbackServices']);

// REST API of Building
angular.module('buildingServices', [ 'ngResource' ]).factory('Building', function($resource) {
    return $resource('/admin/building/:action/:_id', { _id : "@id"}, {

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
                action : 'list',
                page: 1
            }
        },
        packageMapzip : {
            method : 'POST',
            params : {
                action : 'packageMapzip'
            }
        },
        search : {
            method : 'GET',
            params : {
                action : 'search'
            }            
        }                          
    });
});

// REST API of Floor
angular.module('floorServices', [ 'ngResource' ]).factory('Floor', function($resource) {
    return $resource('/admin/floor/:action/:_id', { _id : "@id" }, {
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
    return $resource('/admin/store/:action/:_id', { _id : "@id" }, {
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
    return $resource('/admin/ad/:action/:_id', { _id : "@id" }, {
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
    return $resource('/admin/user/:action/:_id', { _id : "@id" }, {
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
        },
        changePassword : {
            method : 'POST',
            params : {
                action : 'changePassword'
            }        	
        },
        search : {
            method : 'GET',
            params : {
                action : 'search'
            }            
        }                 
    });
});


// REST API of Sdk
angular.module('sdkServices', [ 'ngResource' ]).factory('Sdk', function($resource) {
    return $resource('/admin/resource/sdk/:action/:_id', { _id : "@id" }, {        
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

// REST API of Feedback
angular.module('feedbackServices', [ 'ngResource' ]).factory('Feedback', function($resource) {
    return $resource('/admin/feedback/:action/:_id', { _id : "@id" }, {        
        get : {
            method : 'GET',
            params : {
                action : 'read'
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