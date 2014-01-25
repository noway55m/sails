var utility = Utility.getInstance();

// Controller for list stores
function StoreListCtrl($scope, Store, $scope, $rootScope) {
		
	// Load floor after building finish load
	$rootScope.loadingStore = true;
	$rootScope.$on('floorFinishLoad', function(e, floor) {
		Store.list({
			floorId : floor._id
		}, function(stores) {
			
			// Set icon url
			stores.forEach(function(store){
				if(store.icon)
					store.icon = "/" + imagePath + "/" + store.icon;
				else
					store.icon = "/img/no-image.png";
			});
			$rootScope.stores = stores;
			$rootScope.loadingStore = false;			
		});
	});	

	// Function for add new store
	$scope.add = function(e){

		var addButton = angular.element(e.currentTarget),
			closeButton = addButton.prev(),
			closeButtonTop = addButton.parent().prev().prev().find(".close"),
			form = addButton.parent(),
			inputFields = form.find("input"),
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			nameObj = form.find("input[name=name]"),
			phoneObj = form.find("input[name=phone]"),
			memoObj = form.find("input[name=memo]"),
			linkObj = form.find("input[name=link]"),
			floorObj = form.find("select");

		if (utility.emptyValidate(nameObj, errorMsgObj) &&
			utility.emptyValidate(phoneObj, errorMsgObj) &&
			utility.emptyValidate(memoObj, errorMsgObj) &&
			utility.emptyValidate(linkObj, errorMsgObj)) {
	
			// Disable all fields
			inputFields.attr('disabled', 'disabled');
			floorObj.attr('disabled', 'disabled');
			
			// Disable all buttons
			addButton.button('loading');
			closeButton.hide();
			closeButtonTop.hide();
	
			// Hide error msg
			errorMsgObj.hide();
	
			// Create new ad
			Store.create({
	
				floorId: $rootScope.floor._id,
				name: nameObj.val(),
				phone: phoneObj.val(),
				memo: memoObj.val(),
				link: linkObj.val()
	
			}, function(res){
	
				// Enable all fields
				inputFields.removeAttr('disabled');
				floorObj.removeAttr('disabled');
				
				// Enable all buttons
				addButton.button('reset');
				closeButton.show();
				closeButtonTop.show();
					
				// add new store
				if(res.icon)
					res.icon = "/" + imagePath + "/" + res.icon;
				else
					res.icon = "/img/no-image.png";						
				$rootScope.stores.push(res);
				
				// Clean all fields and close dialog
				inputFields.val("");
				form.parent().parent().parent().modal('hide');
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");					
	
			}, function(res){

				// Enable all fields
				inputFields.removeAttr('disabled');
				floorObj.removeAttr('disabled');
				
				// Enable all buttons
				addButton.button('reset');
				closeButton.show();
				closeButtonTop.show();			

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				errorMsgObj.find(".errorText").text(errorMsg);
				errorMsgObj.show();
				$().toastmessage('showErrorToast', errorMsg);						        

			});
	
		}		
				
	};
		
	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.store;
		$("#removeContent").html(deleteObj.name);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		Store.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	for(var i=0; i<$rootScope.stores.length; i++){			
					if($rootScope.stores[i]._id == id){    			
						$rootScope.stores.splice(i, 1);
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

	// Function for select
	$scope.selectStore = function(obj){
		$rootScope.selectedStore = obj;
		$rootScope.selectedStoreClone = angular.copy($rootScope.selectedStore); // Clone selected for future rollback
	};

    // Function for rollback selected
    $scope.cancelUpdateStore = function(){
        angular.copy($rootScope.selectedStoreClone, $rootScope.selectedStore);
    };	

	// Function for update
	$scope.updateStore = function(e, selectedStore){
		updateStore(e, selectedStore, Store, $scope, $rootScope);	
	};

	// Function for upload image
	$scope.uploadStoreImage = function(e, selectedStore){
		uploadStoreImage(e, selectedStore, $scope, $rootScope);
	};	
	
}

// Controller for show specific store
function StoreShowCtrl($scope, $location, Store, $rootScope, Building, Floor){

    // Get store info and floor info
    var url = $location.absUrl(),
    	id = url.substring(url.lastIndexOf("/") + 1, url.length);
    
	$rootScope.loadingStore = true;
    Store.get({ _id : id }, function(store){
    	
    	// Set icon url
		if(store.icon)
			store.icon = "/" + imagePath + "/" + store.icon;
		else
			store.icon = "/img/no-image.png";
    	
		// Set store
		$rootScope.selectedStore = store;
    	
    	// Clone store for future rollback
    	$rootScope.selectedStoreClone = angular.copy(store); 

    	$rootScope.$emit('storeFinishLoad', store);

    });
        
    // Include math library
	$scope.Math = window.Math;

    // Function for rollback selected user info
    $scope.cancelUpdateStore = function(){
        angular.copy($rootScope.storeClone, $rootScope.store);
    };
		
	// Function for update the basic fields
	$scope.updateStore = function(e, selectedStore, Store, $scope, $rootScope){
		updateStore(e, selectedStore, Store, $scope, $rootScope);	
	};
	
	// Function for upload store image
	$scope.uploadStoreImage = function(e, selectedStore){
		uploadStoreImage();		
	};

}


// Function for update building
function updateStore(e, selectedStore, Store, $scope, $rootScope){

    var store = selectedStore,
        updateButton = angular.element(e.currentTarget),
        form = updateButton.parent(),
        inputFields = form.find("input");
        selectFloor = form.find("select"),
        errorMsgObj = form.find(".error-msg"),
        utility = Utility.getInstance(),
        nameObj = form.find("input[name=name]"),
        phoneObj = form.find("input[name=phone]"),
        linkObj = form.find("input[name=link]"),
        memoObj = form.find("input[name=memo]");

    if (utility.emptyValidate(nameObj, errorMsgObj) &&
        utility.emptyValidate(phoneObj, errorMsgObj) &&
        utility.emptyValidate(memoObj, errorMsgObj) &&
        utility.emptyValidate(linkObj, errorMsgObj)) {

		// Disable all fields before finish save
		inputFields.attr('disabled', 'disabled');

		// Hide error msg block
		errorMsgObj.hide();

		// Set loading state of update button
		updateButton.button('loading');

		// Update store
		Store.save(store, function(store){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

			// Clone user info
	        $rootScope.selectedStoreClone = angular.copy(store);                

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Update successfully");	                		        
	        
		}, function(res){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			errorMsgObj.find(".errorText").text(errorMsg);
			errorMsgObj.show();
			$().toastmessage('showErrorToast', errorMsg);	
           
		});

	}

}

// Function for upload store image
function uploadStoreImage(e, selectedStore, $scope, $rootScope){
	
	var store = selectedStore,
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
				
				// Update icon
				$scope.$apply(function () {
					store.icon = "/" + imagePath + "/" + res;
				});
				
				// Clone user info
		        $rootScope.storeClone = angular.copy(store); 
		        
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload successfully");				        
		        
			}

			// Hide button
			uploadButton.button("reset");
			uploadButton.hide();
			return true;
		},

		error : function(res, status){

			// Enable buttion
			uploadButton.button("reset");

			// Show error msg
			$().toastmessage('showErrorToast', "Fail to upload file");		        

		},		

		// other available options:
		clearForm : true
		
	};
	
	form.ajaxSubmit(options);

	return false;		
	
};