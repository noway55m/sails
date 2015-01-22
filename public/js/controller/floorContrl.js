var utility = Utility.getInstance();

// List buildings controller
function FloorListCtrl($scope, Floor, $rootScope) {
	
	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
		
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	
	
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
			layer: 1 

		}, function(floor) {

			// Update local buildings
			$rootScope.floors.unshift(floor);
			$rootScope.floorUp.unshift(floor);

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
			layer: -1
			
		}, function(floor) {

			// Update local buildings
			$rootScope.floors.push(floor);
			$rootScope.floorDown.push(floor);

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
	
	
	// Function for setup delete dialog
	var deleteObj2,
		deleteModal2 = $("#deleteModalFloor"),
		loadingModal = $("#loadingModal");
	$scope.deleteDialogSetup = function(){
		deleteObj2 = this.floor;
		var content = deleteObj2.layer > 0 ? deleteObj2.layer + " F" : "B " + Math.abs(deleteObj2.layer);
		deleteModal2.find(".removeContent").html(content);
		deleteModal2.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide delete confirm modal
		deleteModal2.modal('hide');

		// Show loading modal
		loadingModal.modal('show');
		
		// Delete store
		Floor.delete({
			
			_id: deleteObj2._id
			
		}, function(res){

			if(res._id){
		    	
				var id = res._id, j;
		    	if(deleteObj2.layer > 0){
		    		
		    		for(var i=0; i<$rootScope.floorUp.length; i++){						
		    			// Get removed floor index
		    			if($rootScope.floorUp[i]._id == id)    			
							j = i;		    			
		    		}
		    		
	    			// Remove floor
		    		$rootScope.floorUp.splice(j, 1);
		    				    		
		    	}else{
		    		
		    		for(var i=0; i<$rootScope.floorDown.length; i++){						
		    			// Get removed floor index
		    			if($rootScope.floorDown[i]._id == id)    			
		    				j = i;		    			
		    		}
		    		
		    		// Remove floor
					$rootScope.floorDown.splice(j, 1);
		    				    				    		
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

		// Get floors of building
		Floor.list({ buildingId: floor.buildingId }, function(floors){
			var layers = [];			  
			for(var j=-maxBasementNumber; j<=maxFloorNumber; j++){

				var isFound = false;			  
				for(var i=0; i<floors.length; i++)
					if( j == floors[i].layer && j!= floor.layer)
						isFound = true;
				if(!isFound) {
					if(j<0)
						layers.push({
							name : 'B' + Math.abs(j),
							value : j							
						});											
					else
						if(j!=0)
							layers.push({
								name : 'F' + j,
								value : j							
							});																			
				}				
			}
			$scope.layers = layers;
		});

		// Clone floor for future rollback
        $rootScope.floorClone = angular.copy(floor); 
				
		// Trigger load stores of this floor
		$rootScope.$emit('floorFinishLoad', floor);
		$rootScope.loadingFloor = false;
		
	});

	
	// Function for update floor or basement stuts of current floor
	$scope.updateUp = function() {
		if($rootScope.floor.layer > 0)
			$rootScope.up = true;
		else
			$rootScope.up = false;
	}

    // Function for rollback selected user info
    $scope.cancelUpdateFloor = function(){
        angular.copy($rootScope.floorClone, $rootScope.floor);
    };	
	
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
	        
	    if (utility.emptyValidate(nameObj, errorMsgObj)){
	
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

				// Clone user info
				var stores = $rootScope.floorClone.stores;
		        $rootScope.floorClone = angular.copy(floor);				
		        $rootScope.floorClone.stores = stores;
		        
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Update successfully");		        
		        
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
	
	// Function for upload map.xml
	$scope.uploadMap = function(e){
		
		var floor = this.floor,
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
		
		var floor = this.floor,
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
	
}

// FloorListCtrl.$inject = ['$scope', 'Building'];
