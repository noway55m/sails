// Include all service in app
var app = angular.module('sails', ['ngResource', 'buildingServices', 'floorServices', 'storeServices', 'adServices']);

// REST API of Building
angular.module('buildingServices', [ 'ngResource' ]).factory('Building', function($resource) {
    return $resource('/user/building/:action/:id', { id : "@id" }, {

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

// REST API of Floor
angular.module('floorServices', [ 'ngResource' ]).factory('Floor', function($resource) {
    return $resource('/user/floor/:action/:id', { id : "@id" }, {
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
    return $resource('/user/store/:action/:id', { id : "@id" }, {
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
    return $resource('/user/ad/:action/:id', { id : "@id" }, {
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
