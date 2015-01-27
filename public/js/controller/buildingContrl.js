var utility = Utility.getInstance();

// List buildings controller
function BuildingListCtrl($scope, Building, $compile, $rootScope, Floor) {

	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	
	
    // List all buildings
	$scope.loading = true;
	$scope.hasPagination = true;

	// Load building list
	Building.list( {}, function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			buildings = obj.buildings;

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

				name : name.val()

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
				
				// Close dialog
				$("#add-building-dialog").modal("hide");

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.createSuccess);				

			}, function(res) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				addButton.button("reset");				

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg); 

			});

		}

	};

	// Function for setup delete dialog
	var deleteObj, deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.building;
		deleteModal.find("#removeContent").html(deleteObj.name);
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
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};

	// Function for load specific page
	$scope.loadPage = function(e, page){

		var element = angular.element(e.currentTarget);
		Building.list({ page: page }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				buildings = obj.buildings;

			// Set icon url
			buildings.forEach(function(building){
				if(building.icon)
					building.icon = "/" + imagePath + "/" + building.icon;
				else
					building.icon = "/img/no-image.png";
			});		
			$scope.buildings = buildings;

		});

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
		$scope.building = building;
		$rootScope.$emit('buildingFinishLoad', building);
        $rootScope.buildingClone = angular.copy(building); // Clone building for future rollback        
    	$scope.loadingBuilding = false;
	});

	// Function for add active class on tab
	$scope.addTabActiveClass = function(e) {
		$(".tab-button").removeClass("active");
		angular.element(e.currentTarget).addClass("active");
	}

    // Function for rollback selected user info
    $scope.cancelUpdateBuilding = function(){
        angular.copy($rootScope.buildingClone, $scope.building);
    };

	// Function for update building
	$scope.updateBuilding = function(e) {

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
				$().toastmessage('showSuccessToast', dialogInfo.updateSuccess);						        
		        
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
					
				// Update building 
				$scope.$apply(function () {
					building.icon = "/" + imagePath + "/" + res;
			        $rootScope.buildingClone = angular.copy(building); // clone building						
				});
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.uploadSuccess);									

				// Hide button
				uploadButton.button("reset");
				uploadButton.hide();
				return true;
			},
			error : function(res, status){

				// Hide button
				uploadButton.button("reset");

				// Show error msg
				var resText = ( res.responseJSON && res.responseJSON.msg ) || dialogInfo.failToUpload
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
						
			// Update info	
			building.mapzipUpdateTime = res.mapzipUpdateTime;

			// Reset button
			updateButton.button('reset');
			
	    	// Show success msg
			$().toastmessage('showSuccessToast', dialogInfo.packageSuccess);							
			
		}, function(res){

			// Show error msg
			var resText = ( res.responseJSON && res.responseJSON.msg ) || dialogInfo.failToUpload
			$().toastmessage('showErrorToast', resText );		        			

		});		
		
	};
		
}

// BuildingShowCtrl.$inject = ['$scope', 'Building'];