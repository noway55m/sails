var utility = Utility.getInstance();

// List buildings controller
function FloorListCtrl($scope, Floor, $rootScope) {
	
	// Include math library
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


// Show specific floor controller
function FloorShowCtrl($scope, $location, Floor, $rootScope) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length);
	
	// Include math library	
	$scope.Math = window.Math;
	
	// Get floor
	$rootScope.floor = Floor.get({ _id : id }, function(floor){
		
		// Check is floor or basement
		if(floor.layer > 0)
			$rootScope.up = true;
		else
			$rootScope.up = false;
		
		// Trigger load stores of this floor
		$rootScope.$emit('floorFinishLoad', floor);
		
	});
	
	// Function for update floor
	$scope.updateFloor = function(e){
		
        var floor = this.floor,
	        updateButton = angular.element(e.currentTarget),
	        form = updateButton.parent(),
	        inputFields = form.find("input");
	        errorMsgObj = form.find(".error-msg"),
	        utility = Utility.getInstance(),
	        nameObj = form.find("input[name=name]"),
	        descObj = form.find("input[name=desc]");
	        
	    if (utility.emptyValidate(nameObj, errorMsgObj) && utility.emptyValidate(descObj, errorMsgObj) ){
	
			// Disable all fields before finish save
			inputFields.attr('disabled', 'disabled');
	
			// Hide error msg block
			errorMsgObj.hide();
	
			// Set loading state of update button
			updateButton.button('loading');
	
			// Update store
			floor.$save(function(floor){
	
				// Set back normal state of update button
				updateButton.button('reset');
	
				// Enable all input fields
				inputFields.removeAttr('disabled');
	
			}, function(res){
	
				// Show error msg
			    errorMsgObj.find(".errorText").text(res.msg);
				errorMsgObj.show();
	
				// Set back normal state of update button
				updateButton.button('reset');
	
				// Enable all input fields
				inputFields.removeAttr('disabled');
	
			});
	
	    }		
		
	};
	
	// Function for update map.xml and path.xml
	$scope.uploadMapAndPath = function(e){
		
		var uploadButton = angular.element(e.currentTarget),
			form = uploadButton.prev(),
			inputFields = form.find("input"),
			errorMsgObj = form.find('.error-msg');
			
		// Ajax from setup
		var options = {
	
			beforeSend : function(){ // pre-submit callback
				inputFields.attr('disabled');
				errorMsgObj.hide();
				uploadButton.button("loading");
				return true;
			},
			uploadProgress : function(event, position, total, percent){},
			success : function(res, statusText){ // post-submit callback
				// Show error msg
				if(res.msg){
					errorMsgObj.find(".errorText").text(res.msg);
					errorMsgObj.show();
				}
				
				// Hide button
				uploadButton.button("reset");
				uploadButton.hide();
				return true;
			},
	
			// other available options:
			clearForm : true
			
		};
		
		form.ajaxSubmit(options);
	
		return false;			
		
	};
	
}

// FloorListCtrl.$inject = ['$scope', 'Building'];
