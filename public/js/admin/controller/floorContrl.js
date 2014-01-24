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
			$rootScope.loadingFloor = false;
			
		});

	});

	// Add up floor
	$scope.addFloor = function(e) {

		// Change button to loading status
		var addButton = angular.element(e.currentTarget);
		addButton.button('loading');

		// Create new building
		Floor.create({

			buildingId: $rootScope.building._id,
			layer: 1 // $rootScope.currentUpFloor

		}, function(floor) {

			// Update local buildings
			$rootScope.floors.unshift(floor);
			$rootScope.floorUp.unshift(floor);
			$rootScope.currentUpFloor = $rootScope.currentUpFloor + 1;

			// Reset button status
			addButton.button('reset');

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Add floor successfully");
			
		}, function(err) {

	    	// Show error msg				
			if( err && err.data && err.data.msg ) {

				// Reset button status
				addButton.button('reset');

				// Show error msg
				$().toastmessage( 'showErrorToast', err.data.msg );

			}

		});

	};

	// Add down floor
	$scope.addBasement = function(e){

		// Change button to loading status
		var addButton = angular.element(e.currentTarget);
		addButton.button('loading');

		// Create new building
		Floor.create({

			buildingId: $rootScope.building._id,
			layer: -1 // $rootScope.currentDownFloor
			
		}, function(floor) {

			// Update local buildings
			$rootScope.floors.push(floor);
			$rootScope.floorDown.push(floor);
			$rootScope.currentDownFloor = $rootScope.currentDownFloor - 1;

			// Reset button status
			addButton.button('reset');

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Add basement successfully");			
			
		}, function(err) {

	    	// Show error msg				
			if( err && err.data && err.data.msg ) {

				// Reset button status
				addButton.button('reset');

				// Show error msg
				$().toastmessage( 'showErrorToast', err.data.msg );

			}

		});

	};
	
	// Function for select specific floor
	$scope.selectFloor = function(floor){
		$rootScope.selectedFloor = floor;
		$rootScope.selectedFloorClone = angular.copy($rootScope.selectedFloor); // Clone building for future rollback
	};

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal"),
		loadingModal = $("#loadingModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.floor;
		var content = deleteObj.layer > 0 ? deleteObj.layer + " F" : "B " + Math.abs(deleteObj.layer);
		$("#removeContent").html(content);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide delete confirm modal
		deleteModal.modal('hide');

		// Show loading modal
		loadingModal.modal('show');
		
		// Delete store
		Floor.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
		    	
				var id = res._id, j;
		    	if(deleteObj.layer > 0){
		    		
		    		for(var i=0; i<$rootScope.floorUp.length; i++){						
		    			// Update other floor's layer
		    			if($rootScope.floorUp[i].layer > deleteObj.layer)
		    				$rootScope.floorUp[i].layer = $rootScope.floorUp[i].layer - 1;
		    			// Get removed floor index
		    			if($rootScope.floorUp[i]._id == id)    			
							j = i;		    			
		    		}
		    		
	    			// Remove floor
		    		$rootScope.floorUp.splice(j, 1);
		    		
		    		// Update current up floor
		    		$rootScope.currentUpFloor = $rootScope.currentUpFloor - 1;
		    		
		    	}else{
		    		
		    		for(var i=0; i<$rootScope.floorDown.length; i++){						
		    			// Update other floor's layer
		    			if($rootScope.floorDown[i].layer < deleteObj.layer)		    				
		    				$rootScope.floorDown[i].layer = $rootScope.floorDown[i].layer + 1;		    			
		    			// Get removed floor index
		    			if($rootScope.floorDown[i]._id == id)    			
		    				j = i;		    			
		    		}
		    		
		    		// Remove floor
					$rootScope.floorDown.splice(j, 1);
		    		
		    		// Update current down floor
		    		$rootScope.currentDownFloor = $rootScope.currentDownFloor + 1;
		    				    		
		    	}
		    	
				// Remove floor from floors		    	
		    	for(var i=0; i<$rootScope.floors.length; i++){			
					if($rootScope.floors[i]._id == id){    			
						$rootScope.floors.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			} else {

		    	// Show error msg
				$().toastmessage('showErrorToast', res.msg);

			}

			// Hide loading modal
			loadingModal.modal('hide');
			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};

	// Function for update building
	$scope.updateFloor = function(e, selectedFloor) {
		updateFloor(e, selectedFloor, Floor, $scope, $rootScope);	
	};

	// Function for upload file
	$scope.uploadFile = function(e, selectedFloor, fileName){
		uploadFile(e, selectedFloor, fileName, $scope, $rootScope);
	}

    // Function for rollback selected user info
    $scope.cancelUpdateFloor = function(){
        angular.copy($rootScope.selectedFloorClone, $rootScope.selectedFloor);
    };	

}


// Show specific floor controller
function FloorShowCtrl($scope, $location, Floor, Building, $rootScope) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length);
	
	// Include math library	
	$scope.Math = window.Math;
	
	// Get floor
	$rootScope.loadingFloor = true;
	$rootScope.floor = Floor.get({ _id : id }, function(floor){
		
		// Check is floor or basement
		if(floor.layer > 0)
			$rootScope.up = true;
		else
			$rootScope.up = false;
		
		// Get building
		Building.get({ _id: floor.buildingId }, function(building){
			$rootScope.building = building;
		});

		// Clone floor for future rollback
        $rootScope.floorClone = angular.copy(floor); 
				
		// Trigger load stores of this floor
		$rootScope.$emit('floorFinishLoad', floor);
		$rootScope.loadingFloor = false;
		
	});

    // Function for rollback selected user info
    $scope.cancelUpdateFloor = function(){
        angular.copy($rootScope.floorClone, $rootScope.floor);
    };	
	
	// Function for update building
	$scope.updateFloor = function(e, selectedBuilding) {
		updateBuilding(e, selectedBuilding, Floor, $scope, $rootScope);	
	};
	
	// Function for upload map.xml
	$scope.uploadMap = function(e){
		
		var floor = this.floor
			uploadButton = angular.element(e.currentTarget),
			form = uploadButton.prev(),
			inputFields = form.find("input"),
			errorMsgObj = form.find('.error-msg');
		
		// Ajax from setup
		var options = {
	
			beforeSend : function(){ // pre-submit callback
				
				// Hide error msg block
				errorMsgObj.hide();						
				
				// Check both file upload
				if(!$(inputFields[1]).val()){
					
					errorMsgObj.find('.errorText').text("Map file is empty!");	
					errorMsgObj.show();	
					return false
					
				}else{
					inputFields.attr('disabled');
					errorMsgObj.hide();
					uploadButton.button("loading");
					return true;
				}
				
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
				
				// Update and clone
				$scope.$apply(function () {
					floor.lastXmlUpdateTime = res.lastXmlUpdateTime;
					floor.map = res.map;					
					var stores = $rootScope.floorClone.stores;
			        $rootScope.floorClone = angular.copy(floor);				
			        $rootScope.floorClone.stores = stores;										
				});
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload map file successfully");		        

				return true;
				
			},

			error : function(res, status){

				// Enable buttion
				uploadButton.button("reset");

				// Show error msg
				$().toastmessage('showErrorToast', "Fail to upload map file");		        

			},
	
			// other available options:
			clearForm : true
			
		};
		
		form.ajaxSubmit(options);
	
		return false;			
		
	};

	// Function for upload path.xml
	$scope.uploadPath = function(e){
		
		var floor = this.floor
			uploadButton = angular.element(e.currentTarget),
			form = uploadButton.prev(),
			inputFields = form.find("input"),
			errorMsgObj = form.find('.error-msg');
		
		// Ajax from setup
		var options = {
	
			beforeSend : function(){ // pre-submit callback
				
				// Hide error msg block
				errorMsgObj.hide();						
				
				// Check both file upload
				if(!$(inputFields[1]).val()){
					
					errorMsgObj.find('.errorText').text("Path file is empty!");	
					errorMsgObj.show();	
					return false
					
				}else{
					inputFields.attr('disabled');
					errorMsgObj.hide();
					uploadButton.button("loading");
					return true;
				}
				
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
				
				// Update and clone
				$scope.$apply(function () {
					floor.lastXmlUpdateTime = res.lastXmlUpdateTime;
					floor.path = res.path;					
					var stores = $rootScope.floorClone.stores;
			        $rootScope.floorClone = angular.copy(floor);				
			        $rootScope.floorClone.stores = stores;										
				});
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload path file successfully");		        

				return true;
				
			},
	
			error : function(res, status){

				// Enable buttion
				uploadButton.button("reset");

				// Show error msg
				$().toastmessage('showErrorToast', "Fail to upload path file");		        

			},

			// other available options:
			clearForm : true
			
		};
		
		form.ajaxSubmit(options);
	
		return false;			

	}

	// Function for select specific floor
	$scope.selectFloor = function(floor){
		$rootScope.selectedFloor = floor;
		$rootScope.selectedFloorClone = angular.copy($rootScope.selectedFloor); // Clone building for future rollback
	};
	
	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.floor;
		$("#removeContent").html(deleteObj.name);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		Building.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	for(var i=0; i<$scope.buildings.length; i++){			
					if($scope.buildings[i]._id == id){    			
						$scope.buildings.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};

}


// Function for update floor
function updateFloor(e, selectedFloor, Floor, $scope, $rootScope){

	var floor = this.floor || selectedFloor,
		updateButton = angular.element(e.currentTarget),
		form = updateButton.parent(),
		inputFields = form.find("input");
		errorMsgObj = form.find(".error-msg"),
		utility = Utility.getInstance(),
		nameObj = form.find("input[name=name]"),
		descObj = form.find("textarea[name=desc]");

	if (utility.emptyValidate(nameObj, errorMsgObj)) {

		// Disable all fields before finish save
		inputFields.attr('disabled', 'disabled');
		descObj.attr('disabled', 'disabled');

		// Hide error msg block
		errorMsgObj.hide();

		// Set loading state of update button
		updateButton.button('loading');

		Floor.save( floor, function(floor){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');
			descObj.removeAttr('disabled');

			// Clone user info
	        $rootScope.floorClone = angular.copy(floor);

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Update successfully");						        
	        
		}, function(res){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');
			descObj.removeAttr('disabled');

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			errorMsgObj.find(".errorText").text(errorMsg);
			errorMsgObj.show();
			$().toastmessage('showErrorToast', errorMsg);						        

		});

	}

};

// Function for upload file
function uploadFile(e, selectedFloor, fileName, $scope, $rootScope){

	var floor = this.floor || selectedFloor,
		uploadButton = angular.element(e.currentTarget),
		form = uploadButton.prev(),
		inputFields = form.find("input"),
		errorMsgObj = form.find('.error-msg');
	
	// Ajax from setup
	var options = {

		beforeSend : function(){ // pre-submit callback
			
			// Hide error msg block
			errorMsgObj.hide();						
			
			// Check both file upload
			if(!$(inputFields[1]).val()){
				
				errorMsgObj.find('.errorText').text(fileName + " file is empty!");	
				errorMsgObj.show();	
				return false
				
			}else{
				inputFields.attr('disabled');
				errorMsgObj.hide();
				uploadButton.button("loading");
				return true;
			}
			
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
			
			// Update and clone
			$scope.$apply(function () {

				floor.lastXmlUpdateTime = res.lastXmlUpdateTime;

				if(fileName == "map") {

					floor.map = res.map;					

				} else if(fileName == "path") {

					floor.path = res.path;					

				} else if(fileName == "render") {

					floor.render = res.render;					

				} else if(fileName == "region") {

					floor.region = res.region;					
				
				} else if(fileName == "mapzip") {

					floor.mapzip = res.mapzip;					
				
				} else {

					floor.applist = res.applist;					
				
				}

				// Clone floor info
		        $rootScope.selectedFloorClone = angular.copy(floor);

			});
			
	    	// Show success msg
			$().toastmessage('showSuccessToast', "Upload "  + fileName + " file successfully");		        

			return true;
			
		},

		error : function(res, status){

			// Enable buttion
			uploadButton.button("reset");

			// Show error msg
			$().toastmessage('showErrorToast', "Fail to upload " + fileName + " file");		        

		},

		// other available options:
		clearForm : true
		
	};
	
	form.ajaxSubmit(options);

	return false;		

}            

// FloorListCtrl.$inject = ['$scope', 'Building'];
