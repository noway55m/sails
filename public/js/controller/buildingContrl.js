var utility = Utility.getInstance();

// REST Setup
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



// List buildings controller
function BuildingListCtrl($scope, Building) {

	$scope.buildings = Building.list();
	$scope.addBuilding = function(d) {

		var addBlock = "#add-building-block",
			inputs = $(addBlock + " input"),
			buttons = $(addBlock + " button"),
			name = $(inputs[0]), 
			desc = $(inputs[1]), 
			errorMsgObj = $("#error-dialog");

		// Clean error msg
		errorMsgObj.css({
			display : "none"
		});
		errorMsgObj.children(".errorText").html("");

		// Check format
		if (utility.emptyValidate(name, errorMsgObj)) {

			// Disable all fields and buttons
			inputs.attr("disabled", "disabled");
			buttons.button('loading');
			
			// Create new building
			Building.create({

				name : name.val(),
				desc : desc.val()

			}, function(data) {
				
				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				buttons.button("reset");
				
				// Update local buildings
				$scope.buildings.push(data.building);

			}, function(err) {

				// Enable all fields and button				
				inputs.removeAttr("disabled");
				buttons.removeAttr("disabled");

			});

		}

	}

}

// Show specific building controller
function BuildingShowCtrl($scope, $location, Building, $rootScope) {
	var url = $location.absUrl(), 
		id = url.substring(url.lastIndexOf("/") + 1, url.length);
	$scope.building = Building.get({ id : id }, function(building){
		$rootScope.$emit('buildingFinishLoad', building);
	});
}


// BuildingShowCtrl.$inject = ['$scope', 'Building'];
