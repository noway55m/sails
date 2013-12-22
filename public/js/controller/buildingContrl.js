var utility = Utility.getInstance();

// List buildings controller
function BuildingListCtrl($scope, Building) {

	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	
	
    // List all buildings
	$scope.loading = true;
	Building.list(function(buildings){
		
		// Set icon url
		buildings.forEach(function(building){
			if(building.icon)
				building.icon = "/" + imagePath + "/" + building.icon;
			else
				building.icon = "/img/no-image.png";
		});		
		$scope.buildings = buildings;
		$scope.loading = false;
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
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(err) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				addButton.removeAttr("disabled");

			});

		}

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

// Show specific building controller
function BuildingShowCtrl($scope, $location, Building, $rootScope) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length);	
	$scope.loadingBuilding = true;
	$rootScope.loadingFloor = true;	
	Building.get({ _id : id }, function(building){
		if(building.icon)
			building.icon = "/" + imagePath + "/" + building.icon;
		else
			building.icon = "/img/no-image.png";	    
		$scope.building = building;
		$rootScope.$emit('buildingFinishLoad', building);
        $rootScope.buildingClone = angular.copy(building); // Clone building for future rollback        
    	$scope.loadingBuilding = false;
	});

    // Function for rollback selected user info
    $scope.cancelUpdateBuilding = function(){
        angular.copy($rootScope.buildingClone, $scope.building);
    };

	// Function for update building
	$scope.updateBuilding = function(e){

		var building = this.building,
			updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			timeFields = form.find("input[data-provide=datepicker]"),
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

			building.$save( function(building){

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

				// Show error msg
				errorMsgObj.find(".errorText").text(res.msg);
				errorMsgObj.show();

				// Set back normal state of update button
				updateButton.button('reset');

				// Enable all input fields
				inputFields.removeAttr('disabled');
				descObj.removeAttr('disabled');

			});

		}

	};


    // Function for upload building image
	// Note: we won't use now, all map zip package from server automatically
	/*
    $scope.uploadMapzip = function(e){

        var building = this.building,
            uploadButton = angular.element(e.currentTarget),
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
                }else{
                    $scope.$apply(function () {
                        building.mapzipUpdateTime = res.mapzipUpdateTime;
				        $rootScope.buildingClone = angular.copy(building); // clone building                        
                    });
                }

                // Hide button
                uploadButton.button("reset");
                uploadButton.hide();
                return true;
            },

            clearForm : true

        };

        form.ajaxSubmit(options);

        return false;

    };
    */


	// Function for upload building image
	$scope.uploadBuildingImage = function(e){

		var building = this.building,
			uploadButton = angular.element(e.currentTarget),
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

	};
	
	// Function for package building mapzip
	$scope.packageMapzip = function(e){
		
		var building = this.building,
			updateButton = angular.element(e.currentTarget);
		
		updateButton.button('loading');
		Building.packageMapzip({
		
			_id: building._id 
				
		}, function(res){
						
			if(res.msg){

				building.mapzipUpdateTime = res.msg;				
				
			}else{
				
				building.mapzipUpdateTime = res.mapzipUpdateTime;
				
			}

			updateButton.button('reset');
			
	    	// Show success msg
			$().toastmessage('showSuccessToast', "Package successfully");							
			
		});		
		
	};
		
}


// BuildingShowCtrl.$inject = ['$scope', 'Building'];
