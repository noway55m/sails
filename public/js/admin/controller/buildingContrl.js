var utility = Utility.getInstance();

// List buildings controller
function BuildingListCtrl($scope, Building, $compile, $rootScope, Floor) {
	
    // List all buildings
	$scope.loading = true;
	$scope.hasPagination = true;
	Building.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			buildings = obj.buildings;

		$scope.count = count;

		// Set icon url
		buildings.forEach(function(building){
			if(building.icon)
				building.icon = "/" + imagePath + "/" + building.icon;
			else
				building.icon = "/img/no-image.png";
		});		
		$scope.buildings = buildings;
		$scope.loading = false;
		
		// Trigger pagination		
		if( totalPages > 1 ) {

			$scope.hasPagination = false;
			$("#pagination").paginate({
				count: totalPages,
				start: 1,
				display: 5,
				border: false,
				text_color: '#79B5E3',
				background_color: 'none',	
				text_hover_color: '#2573AF',
				background_hover_color: 'none',
				mouse: 'press'
			});
			$compile( angular.element('#pagination').contents() )($scope);

		}

	});

	// Function for add new building
	$scope.addBuilding = function(e) {

		var addButton = angular.element(e.currentTarget),
		    form = addButton.parent(),
			inputs = form.find("input"),
			name = $(inputs[0]),
			desc = $(inputs[1]),
			errorMsgObj = form.find('.error-msg');

		// Clean error msg
		errorMsgObj.hide();
		errorMsgObj.find(".errorText").text("");

		// Check format
		if (utility.emptyValidate(name, errorMsgObj)) {

			// Disable all fields and buttons
			inputs.attr("disabled", "disabled");
			addButton.button('loading');

			// Create new building
			Building.create({

				name : name.val(),
				desc : desc.val()

			}, function(building) {

				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				addButton.button("reset");

				// Update local buildings
				if(building.icon)
					building.icon = "/" + imagePath + "/" + building.icon;
				else
					building.icon = "/img/no-image.png";					
				$scope.buildings.push(building);
				
				// Add count
				$scope.count++;

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(err) {

				// Enable all fields and button
				addButton.button("reset");				
				inputs.removeAttr("disabled");
				addButton.removeAttr("disabled");

			});

		}

	};

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");		
	$scope.deleteDialogSetup = function(building, useSecondDialog){
		
		deleteObj = this.building;
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
		    	
				// Subtract count
				$scope.count--;

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};

	// Function for load specific page
	$scope.loadPage = function(e, page){

		var url = window.location.toString(),
			element = angular.element(e.currentTarget);
		if(url.indexOf("searchIndex")!=-1) {

			var buildingId = form.find("input[name=buildingId]").val(),
				buildingName = form.find("input[name=buildingName]").val(),
				userId = form.find("input[name=userId]").val();

			var query = {};
			if($("input[name=queryWay]:checked").val() == 1) {
				query.buildingId = buildingId;
			} else {
				query.buildingName = buildingName;
				query.userId = userId;
				query.page = page;
			}			
								
			Building.search(query, function(obj){
				
				var page = obj.page,
					offset = obj.offset,
					count = obj.count,
					buildings = obj.buildings;

				$scope.count=count;

				// Set icon url
				buildings.forEach(function(building){
					if(building.icon)
						building.icon = "/" + imagePath + "/" + building.icon;
					else
						building.icon = "/img/no-image.png";
				});	

				$scope.buildings = buildings;

			});

		} else {

			Building.list({ page: page }, function(obj){
				
				var page = obj.page,
					offset = obj.offset,
					count = obj.count,
					buildings = obj.buildings;

				$scope.count=count;

				// Set icon url
				buildings.forEach(function(building){
					if(building.icon)
						building.icon = "/" + imagePath + "/" + building.icon;
					else
						building.icon = "/img/no-image.png";
				});		
				$scope.buildings = buildings;

			});

		}		

	};


	// Search way control
	$("input[name=queryWay]").change(function(event) {
		if(this.value == "1"){
			$("input[name=buildingId]").css("display", "");
			$("input[name=buildingName]").css("display", "none");
			$("input[name=username]").css("display", "none");
			$("input[name=userId]").css("display", "none");			
		} else {
			$("input[name=buildingId]").css("display", "none");
			$("input[name=buildingName]").css("display", "");
			$("input[name=username]").css("display", "");
			$("input[name=userId]").css("display", "");
		}
	});

	// Search buildings with specific building id, name, user id, name
	$scope.searchBuilding = function(e){

		// Get search username string
		var addButton = angular.element(e.currentTarget),
			form = addButton.parent(),
			buildingId = form.find("input[name=buildingId]").val(),
			buildingName = form.find("input[name=buildingName]").val(),
			userId = form.find("input[name=userId]").val();	
			
		var query = {};
		if($("input[name=queryWay]:checked").val() == 1) {
			query.buildingId = buildingId;
		} else {
			query.buildingName = buildingName;
			query.userId = userId;
		}	

		// Get all search results	
		Building.search(query, function(obj){

			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				totalPages = Math.ceil(count/offset),
				buildings = obj.buildings;

			$scope.count = count;	
			$scope.buildings = buildings;

			// Trigger pagination		
			if( totalPages > 1 ) {

				$("#pagination").css("display", "");
				$("#pagination").paginate({
					count: totalPages,
					start: 1,
					display: 5,
					border: false,
					text_color: '#79B5E3',
					background_color: 'none',	
					text_hover_color: '#2573AF',
					background_hover_color: 'none',
					mouse: 'press'
				});
				$compile( angular.element('#pagination').contents() )($scope);

			} else {

				$("#pagination").css("display", "none");

			}

		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});	

	}

	// Function for select specific building
	$scope.selectBuilding = function(building){
		$rootScope.selectedBuilding = building;
		$rootScope.selectedBuildingClone = angular.copy($rootScope.selecedtBuilding); // Clone building for future rollback
	};

    // Function for rollback selected user info
    $scope.cancelUpdateBuilding = function(){
        angular.copy($rootScope.selectedBuildingClone, $scope.selectedBuilding);
    };	

	// Function for update building
	$scope.updateBuilding = function(e, selectedBuilding) {
		updateBuilding(e, selectedBuilding, Building, $scope, $rootScope);	
	};

	// Function for upload building image
	$scope.uploadBuildingImage = function(e, selectedBuilding){
		uploadImage(e, selectedBuilding, $scope, $rootScope);
	};

	// Function for package building mapzip
	$scope.packageMapzip = function(e, selectedBuilding){
		packageMapzip(e, selectedBuilding, Building, $scope, $rootScope);		
	};		
	
}

// Show specific building controller
function BuildingShowCtrl($scope, $location, Building, $rootScope) {

	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length) || $rootScope.selectedBuilding.id;	
	$scope.loadingBuilding = true;
	$rootScope.loadingFloor = true;	
	Building.get({ _id : id }, function(building){
		if(building.icon)
			building.icon = "/" + imagePath + "/" + building.icon;
		else
			building.icon = "/img/no-image.png";	    
		$scope.selectedBuilding = building;
		$rootScope.$emit('buildingFinishLoad', $scope.selectedBuilding);
        $rootScope.selectedBuildingClone = angular.copy($scope.selectedBuilding); // Clone building for future rollback        
    	$scope.loadingBuilding = false;
	});

    // Function for rollback selected user info
    $scope.cancelUpdateBuilding = function(){
        angular.copy($rootScope.selectedBuildingClone, $scope.selectedBuilding);
    };

	// Function for update building
	$scope.updateBuilding = function(e, selectedBuilding) {
		updateBuilding(e, selectedBuilding, Building, $scope, $rootScope);	
	};

	// Function for upload building image
	$scope.uploadBuildingImage = function(e, selectedBuilding){
		var building = this.building || selectedBuilding; 
		uploadImage(e, building, $scope, $rootScope);
	};
	
	// Function for package building mapzip
	$scope.packageMapzip = function(e, selectedBuilding){
		var building = this.building || selectedBuilding;
		packageMapzip(e, building, Building, $scope, $rootScope);		
	};
		
	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.building;
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
			
		});
		
	};

}


// Function for update building
function updateBuilding(e, selectedBuilding, Building, $scope, $rootScope){

	var building = this.building || selectedBuilding,
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

		Building.save( building, function(building){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');
			descObj.removeAttr('disabled');

			// Update local buildings
			if(building.icon)
				building.icon = "/" + imagePath + "/" + building.icon;
			else
				building.icon = "/img/no-image.png";

			// Clone user info
	        $rootScope.buildingClone = angular.copy(building);

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

// Function for upload building image
function uploadImage(e, selectedBuilding, $scope, $rootScope){

	var building = selectedBuilding,
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
				
				errorMsgObj.find('.errorText').text("File is empty!");	
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
			}else{
				
				// Update building 
				$scope.$apply(function () {
					building.icon = "/" + imagePath + "/" + res;
			        $rootScope.buildingClone = angular.copy(building); // clone building						
				});
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload successfully");									
				
			}

			// Hide button
			uploadButton.button("reset");
			uploadButton.hide();
			return true;
		},
		error : function(res, status){

			// Show error msg
			var resText = ( res.responseJSON && res.responseJSON.msg ) || "Fail to upload image"
			$().toastmessage('showErrorToast', resText );		        

		},			

		clearForm : true

	};

	form.ajaxSubmit(options);

	return false;

}

// Function for package mapzip
function packageMapzip(e, selectedBuilding, Building, $scope, $rootScope){
		
	var building = selectedBuilding,
		updateButton = angular.element(e.currentTarget);
	
	updateButton.button('loading');
	Building.packageMapzip({
	
		_id: building._id 
			
	}, function(res){
					
		// Update mapzip package time	
		building.mapzipUpdateTime = res.mapzipUpdateTime;
		
		// Reset button
		updateButton.button('reset');
		
    	// Show success msg
		$().toastmessage('showSuccessToast', "Package successfully");							
		
	}, function(res){

		// Show error msg
		var resText = ( res.responseJSON && res.responseJSON.msg ) || "Fail to upload image"
		$().toastmessage('showErrorToast', resText );		        			

	});

}

// BuildingShowCtrl.$inject = ['$scope', 'Building'];
