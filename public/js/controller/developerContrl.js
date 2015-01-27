var utility = Utility.getInstance();

// List developers controller
function DeveloperListCtrl($scope, DeveloperApplication, $compile, $rootScope) {
	
	$scope.API_KEY_TYPE = API_KEY_TYPE;

	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	

    // List all developerApplications
	$scope.loading = true;
	$scope.hasPagination = true;
	DeveloperApplication.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			developerApplications = obj.developerApplications;

		for(var i=0; i<developerApplications.length; i++) {

			var devapp = developerApplications[i];
			if( devapp.type == API_KEY_TYPE.ANDROID ) {
				devapp.typeDesc = 	"Key for Android application";
				devapp.typeName = 	"Android";				
			} else if( devapp.type == API_KEY_TYPE.IOS ) {
				devapp.typeDesc = 	"Key for IOS application";
				devapp.typeName = 	"IOS";								
			} else if( devapp.type == API_KEY_TYPE.SERVER ) {
				devapp.typeDesc = 	"Key for server application";
				devapp.typeName = 	"Server";								
			} else if( devapp.type == API_KEY_TYPE.BROWSER ) {
				devapp.typeDesc = 	"Key for browser application";
				devapp.typeName = 	"Browser";								
			}

		}	

		$scope.count = count;
		$scope.developerApplications = developerApplications;
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

	// Function for hide app create dialog
	$scope.hideAppCreateDialog = function(e) {
		$("#add-app-dialog").modal('hide');
	}


	// Clean error msg after dialog create
	$('#add-app-iosKey-dialog,#add-app-androidKey-dialog').on('show.bs.modal', function (e) {
		$(".errorText").html("");
		$(".error-msg").hide();
	});

	// Function for create new android key
	$scope.createKey = function(e, type) {

		var addButton = angular.element(e.currentTarget),
		    form = addButton.parent(),
			textarea = form.find("textarea"),
			errorMsgObj = form.find('.error-msg');

		// Clean error msg
		errorMsgObj.hide();
		errorMsgObj.find(".errorText").text("");

		// Check format
		if (utility.emptyValidate(textarea, errorMsgObj)) {

			// Disable all fields and buttons
			textarea.attr("disabled", "disabled");
			addButton.button('loading');

			// Create new android key
			DeveloperApplication.create({

				 verifier: textarea.val(),
				 type: type

			}, function(devApp) {

				// Enable all fields and button
				textarea.removeAttr("disabled").val("");
				addButton.button("reset");
				
				// Add app
				if( devApp.type == API_KEY_TYPE.ANDROID ) {
					devApp.typeDesc = 	"Key for Android application";
					devApp.typeName = 	"Android";				
				} else if( devApp.type == API_KEY_TYPE.IOS ) {
					devApp.typeDesc = 	"Key for IOS application";
					devApp.typeName = 	"IOS";								
				} else if( devApp.type == API_KEY_TYPE.SERVER ) {
					devApp.typeDesc = 	"Key for server application";
					devApp.typeName = 	"Server";								
				} else if( devApp.type == API_KEY_TYPE.BROWSER ) {
					devApp.typeDesc = 	"Key for browser application";
					devApp.typeName = 	"Browser";								
				}

				$scope.developerApplications.push(devApp);
				$scope.count++;				

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.createSuccess);				

				// Hide dialog
				$("#add-app-androidKey-dialog").modal('hide');
				$("#add-app-iosKey-dialog").modal('hide');

			}, function(res) {

				// Set back normal state of add button
				addButton.button("reset");				
				
				// Enable all fields and button
				textarea.removeAttr("disabled");

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				errorMsgObj.find(".errorText").text(errorMsg);
				errorMsgObj.show();
				$().toastmessage('showErrorToast', errorMsg);						        				

			});

		}

	};

	// Function for setup regenerate key dialog
	var regenerateObj,
		regenerateModal = $("#regenerate-key-alert-dialog");	
	$scope.regenerateKeyDialogSetup = function(e) {		
		regenerateObj = this.devApp;
		regenerateModal.modal("show");		
	}

	// Function for refresh key
	$scope.regenerateKey = function(e){

		var refreshButton = angular.element(e.currentTarget),
			devApp = regenerateObj;

		// Disable ubtton
		refreshButton.button("loading");

		// Refresh key
		DeveloperApplication.regenerateKey({

			_id: devApp._id

		}, function(devAppr){

			// Set back normal state of add button
			refreshButton.button("reset");

			// Refresh key on view
			devApp.apiKey = devAppr.apiKey;

			// Hide dialog
			$("#regenerate-key-alert-dialog").modal('hide');

	    	// Show success msg
			$().toastmessage('showSuccessToast', dialogInfo.regenerateSuccess);				

		}, function(res){

			// Set back normal state of add button
			refreshButton.button("reset");				

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			errorMsgObj.find(".errorText").text(errorMsg);
			errorMsgObj.show();
			$().toastmessage('showErrorToast', errorMsg);	
		
		});		

	}

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");		
	$scope.deleteDialogSetup = function(devApp, useSecondDialog){		
		deleteObj = this.devApp;
		$("#removeContent").html(deleteObj.apiKey);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		DeveloperApplication.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	for(var i=0; i<$scope.developerApplications.length; i++){			
					if($scope.developerApplications[i]._id == id){    			
						$scope.developerApplications.splice(i, 1);
						break;
					}
		    	}
		    	
				// Subtract count
				$scope.count--;

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};


	// Function for get the devApp while edit dialog show
	$scope.selectApp = function(e) {
		$scope.selectedDevApp = this.devApp;
		$scope.selectedDevAppClone = angular.copy($scope.selectedDevApp);		
	}

	// Rollback while dialog close
	$("#edit-app-android-verifier-dialog,#edit-app-ios-verifier-dialog,#edit-app-server-verifier-dialog,#edit-app-browser-verifier-dialog")
	.on('hidden.bs.modal', function (e) {
		$scope.$apply(function(){
			angular.copy($scope.selectedDevAppClone, $scope.selectedDevApp);		
		});
	});
	
	// Function update the verifier
	$scope.updateVerifier = function(e) {

		var updateButton = angular.element(e.currentTarget);

		// Disable ubtton
		updateButton.button("loading");

		// Refresh key
		DeveloperApplication.save({

			_id: $scope.selectedDevApp._id,
			verifier: $scope.selectedDevApp.verifier

		}, function(devAppr){

			// Set back normal state of add button
			updateButton.button("reset");

			// Clone
			$scope.selectedDevAppClone = angular.copy(devAppr);

			// Hide dialog
			$("#edit-app-android-verifier-dialog").modal('hide');
			$("#edit-app-ios-verifier-dialog").modal('hide');
			$("#edit-app-server-verifier-dialog").modal('hide');
			$("#edit-app-browser-verifier-dialog").modal('hide');

	    	// Show success msg
			$().toastmessage('showSuccessToast', dialogInfo.createSuccess);				

		}, function(res){

			// Set back normal state of add button
			updateButton.button("reset");				

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			errorMsgObj.find(".errorText").text(errorMsg);
			errorMsgObj.show();
			$().toastmessage('showErrorToast', errorMsg);	
		
		});		

	}

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
	
}