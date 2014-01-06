var utility = Utility.getInstance();

// List buildings controller
function SdkListCtrl($scope, Sdk, $compile, $rootScope, $compile) {
	
    // List all sdks
	$scope.loading = true;
	$scope.hasPagination = true;
	Sdk.list(function(sdks){

		$scope.iosSdks = sdks.iosSdks;	
		$scope.androidSdks = sdks.androidSdks;
		$scope.loading = false;

	});

	// Function for add new sdk
	$scope.addSdk = function(e) {

		var addButton = angular.element(e.currentTarget),
		    form = addButton.parent(),
			inputs = form.find("input"),
			name = $(inputs[0]),
			osType = form.find("select[name='osType'] option:selected"),			
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
			Sdk.create({

				name: name.val(),
				osType: osType.val()

			}, function(sdk) {

				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				addButton.button("reset");

				if( sdk.osType == OS_TYPE.ANDROID ) {

					$scope.androidSdks.push(sdk);

				} else {

					$scope.iosSdks.push(sdk);

				}

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(res) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				addButton.removeAttr("disabled");

				// Show error msg
				var errMsg = ( res && res.data && res.data.msg ) || "Server error, please try again later"; 				
				errorMsgObj.find(".errorText").text(errMsg);
				errorMsgObj.show();
		    	$().toastmessage('showErrorToast', errMsg);				

			});

		}

	};

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(sdk){
		deleteObj = sdk;		
		$("#removeContent").html(deleteObj.version);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		Sdk.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	var osType = res.osType;
		    	
		    	console.log(osType);
		    	console.log(id);

		    	if( osType == OS_TYPE.ANDROID ) {

		    		console.log("ddddfff")
			    	for(var i=0; i<$scope.androidSdks.length; i++){			
						if($scope.androidSdks[i]._id == id){    			
							$scope.androidSdks.splice(i, 1);
							break;
						}
			    	}

		    	} else {

			    	for(var j=0; j<$scope.iosSdks.length; j++){			
						if($scope.iosSdks[j]._id == id){    			
							$scope.iosSdks.splice(j, 1);
							break;
						}
			    	}

		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		});
		
	};

	// Function for select specific building
	$scope.selectSdk = function(sdk){
		$rootScope.selectedSdk = sdk;
		$rootScope.selectedSdkClone = angular.copy($rootScope.selectedSdk); // Clone sdk for future rollback
	};

	// Cancel for update sdk	
	$scope.cancelUpdateSdk = function(){

		// Hide all error msg
		$("#sdk-edit-dialog").find(".error-msg").css("display", "none");

		// Revert original value
		angular.copy($rootScope.selectedSdkClone, $rootScope.selectedSdk);					

	};	 

	// Function for update building
	$scope.updateSdk = function(e, selectedSdk) {
		 updateSdk(e, selectedSdk, $scope, $rootScope, Sdk);
	};

	// Function for upload file (like: sdk or sample code)
	$scope.uploadFile = function(e, sdk){
		
		var sdk = this.sdk || sdk,
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
					return false;
					
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
					sdk.updatedTime = res.updatedTime;
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

// Function for update building
function updateSdk(e, selectedSdk, $scope, $rootScope, Sdk){

	var sdk = this.sdk || selectedSdk,
		updateButton = angular.element(e.currentTarget),
		form = updateButton.parent(),
		inputFields = form.find("input");
		errorMsgObj = form.find(".error-msg"),
		utility = Utility.getInstance(),
		versionObj = form.find("input[name=version]");

	if (utility.emptyValidate(versionObj, errorMsgObj)) {

		// Disable all fields before finish save
		inputFields.attr('disabled', 'disabled');

		// Hide error msg block
		errorMsgObj.hide();

		// Set loading state of update button
		updateButton.button('loading');

		// Update
		Sdk.save( sdk, function(sdk) {

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

			// Clone sdk info
	        $rootScope.selectedSdkClone = angular.copy(sdk);

	        // Update sdk current version
	        if(sdk.isCurrentVersion) {

				if(sdk.osType == OS_TYPE.ANDROID) {

					for( var i=0; i<$scope.androidSdks.length; i++ ) {
						if($scope.androidSdks[i]._id != sdk._id){
							$scope.androidSdks[i].isCurrentVersion = false;
						}
					}

				} else {

					for( var j=0; j<$scope.iosSdks.length; j++ ) {
						if($scope.iosSdks[j]._id != sdk._id)
							$scope.iosSdks[j].isCurrentVersion = false;
					}

				}

	        }

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Update successfully");						        
	        
		}, function(res){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

			// Show error msg
			var errMsg = ( res && res.data && res.data.msg ) || "Server error, please try again later"; 				
			errorMsgObj.find(".errorText").text(errMsg);
			errorMsgObj.show();
	    	$().toastmessage('showErrorToast', errMsg);				


		});

	}

};

// BuildingShowCtrl.$inject = ['$scope', 'Sdk' ];
