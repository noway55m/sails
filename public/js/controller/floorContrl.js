var utility = Utility.getInstance();

// REST Setup
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

// List buildings controller
function FloorListCtrl($scope, Floor, $rootScope) {
	
	$scope.Math = window.Math;
	
	// Load floor after building finish load
	$rootScope.$on('buildingFinishLoad', function(e, building) {
		
		$rootScope.building = building;		
		$rootScope.floors = Floor.list({ buildingId: building._id }, function(floors){
			$rootScope.floorUp = [];
			$rootScope.floorDown = [];			
			floors.forEach(function(floor){
				if(floor.layer > 0 )
					$rootScope.floorUp.push(floor);
				else
					$rootScope.floorDown.push(floor);
				
			});
			
			$rootScope.currentUpFloor = $rootScope.floorUp.length + 1,
			$rootScope.currentDownFloor = -($rootScope.floorDown.length) - 1;
			console.log($rootScope.currentDownFloor);
			
		});

	});
	
	// Add up floor
	$scope.addUpFloor = function(d) {
				
		// Create new building
		Floor.create({

			buildingId: $rootScope.building._id,
			layer: $rootScope.currentUpFloor

		}, function(floor) {
			
			// Update local buildings
			$rootScope.floors.unshift(floor);
			$rootScope.floorUp.unshift(floor);			
			$rootScope.currentUpFloor = $rootScope.currentUpFloor + 1;           

		}, function(err) {});					
		
	}
	
	// Add down floor
	$scope.addDownFloor = function(){
	
		// Create new building
		Floor.create({

			buildingId: $rootScope.building._id,
			layer: $rootScope.currentDownFloor

		}, function(floor) {
			
			// Update local buildings
			$rootScope.floors.push(floor);
			$rootScope.floorDown.push(floor);			
			$rootScope.currentDownFloor = $rootScope.currentDownFloor - 1;           

		}, function(err) {});			
		
	}
	
}

// FloorListCtrl.$inject = ['$scope', 'Building'];
