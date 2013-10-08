// Include all service in app
var app = angular.module('sails', ['ngResource', 'buildingServices', 'floorServices', 
                                   'storeServices', 'adServices', 'userServices']);

// REST API of Building
angular.module('buildingServices', [ 'ngResource' ]).factory('Building', function($resource) {
    return $resource('/building/:action/:_id', { _id : "@id" }, {

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
        }
    });
});
