// Include all service in app
var app = angular.module('sails', ['ngResource', 'ngSanitize', 'poiServices', 'poiEventServices', 'buildingServices', 'floorServices',
                                   'storeServices', 'adServices', 'userServices', 'developerApplicationServices']);

// Custom angular directive for handle "ng-src" is not work on video tag
app.directive('dynamicUrl', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attr) {
            element.attr('src', attr.dynamicUrlSrc);
        }
    };
});


// REST API of Poi
angular.module('poiServices', [ 'ngResource' ]).factory('Poi', function($resource) {
    return $resource('/poi/:action/:_id', { _id : "@id"}, {

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
        copy : {
            method : 'POST',
            params : {
                action : 'copy'
            },
            isArray : true
        },
        getCopies : {
            method : 'GET',
            params : {
                action : 'getCopies'
            },
            isArray : true
        },        
        copyTemplate : {
            method : 'POST',
            params : {
                action : 'copyTemplate'
            },
            isArray : true            
        },
        getCopyTemplates : {
            method : 'GET',
            params : {
                action : 'getCopyTemplates'
            },
            isArray : true
        },
        removeCopy : {
            method : 'POST',
            params : {
                action : 'removeCopy'
            },
            isArray : true
        },
        removeCopyTemplate : {
            method : 'POST',
            params : {
                action : 'removeCopyTemplate'
            },
            isArray : true
        },                                           
    });
});

// REST API of Poi event
angular.module('poiEventServices', ['ngResource']).factory('PoiEvent', function($resource){
   return $resource('/poi/event/:action/:_id', { _id : "@id"}, {
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
        updated : {
            method : 'POST',
            params : {
                action : 'update',
                _id: ""
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
            },
            isArray : true            
        }
    });
})

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
        save : {
            method : 'POST',
            params : {
                action : 'update'
            }
        },
        changePassword : {
            method : 'POST',
            params : {
                action : 'changePassword'
            }        	
        },
        upgradeDeveloper : {
            method : 'POST',
            params : {
                action : 'upgradeDeveloper'
            }        	
        },
        poiTags : {
            method : 'GET',
            params : {
                action : 'poiTags'
            },
            isArray : true                       
        }                    
    });
});

// REST API of Developer
angular.module('developerApplicationServices', [ 'ngResource' ]).factory('DeveloperApplication', function($resource) {
    return $resource('/developer/app/:action/:_id', { _id : "@id" }, {
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
        regenerateKey : {
            method : 'POST',
            params : {
                action : 'regenerateKey'
            }           
        }                
    });
});