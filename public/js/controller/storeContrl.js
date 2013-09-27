var utility = Utility.getInstance();

// REST Setup
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

// List stores controller
function StoreListCtrl($scope, Store, $rootScope) {

//	$scope.stores = Store.list();
//	$scope.addStore= function(d) {
//	}

	// Show stores while floor collapse open
	$(".floor").on("shown.bs.collapse", function(){
		
		// Get current select floor
		$scope.currentSelectedFloor = this.id.replace("layer", "");
		console.log($scope.currentSelectedFloor);
		var j = 0;
		for(var i=0; i<$rootScope.floors.length; i++){
			if($rootScope.floors[i].layer == $scope.currentSelectedFloor){
				j = i;
				break;
			}
		}
				
		$rootScope.floors[j].stores = Store.list({			
			buildingId: $rootScope.building._id,
    		floor: $scope.currentSelectedFloor
    		
		});
			
	});		
	
}

// StoreListCtrl.$inject = ['$scope', 'Building'];
