var utility = Utility.getInstance();

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
	$scope.addFloor = function(d) {

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
	$scope.addBasement = function(){

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
