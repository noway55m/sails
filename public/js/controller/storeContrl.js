var utility = Utility.getInstance();

// Controller for list stores
function StoreListCtrl($scope, Store, $scope, $rootScope) {
	
	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};
		
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
			$rootScope.floor.stores = stores;
			$rootScope.floor.stores.size = stores.length;
			$rootScope.floorClone.stores = angular.copy(stores); 
			$rootScope.loadingStore = false;			
		});
	});	
		
	// Show stores while floor collapse open	
	$(".floor").on("shown.bs.collapse", function(){

		// Get current select floor
		$scope.selectedFloor = this.id;
		var j = 0, i;
		for(i=0; i<$rootScope.floors.length; i++){
			if($rootScope.floors[i]._id == $scope.selectedFloor){
				j = i;
				break;
			}
		}
		
		// Set stores on specific floor
		Store.list({
		
			floorId: $scope.selectedFloor
		
		}, function(stores){
			
			// Set icon url
			stores.forEach(function(store){
				if(store.icon)
					store.icon = "/" + imagePath + "/" + store.icon;
				else
					store.icon = "/img/no-image.png";
			});			
			$rootScope.floors[j].stores	= stores;
			$rootScope.loadingStore = false;			
		});

		// Set current selected floor on field floor
		$("#add-store-form select option[value=" + $scope.selectedFloor + "]").attr("selected", "selected");

	});

	// Function for add new store
	$scope.addStore = function(e){
		var addButton = angular.element(e.currentTarget),
			closeButton = addButton.prev(),
			closeButtonTop = addButton.parent().prev().prev().find(".close"),
			form = addButton.parent().prev(),
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
				$rootScope.floor.stores.push(res);
				
				// Update size
				$rootScope.floor.stores.size++; 
				
				// Clean all fields and close dialog
				inputFields.val("");
				form.parent().parent().parent().modal('hide');
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.createSuccess);					
						
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
		    	for(var i=0; i<$rootScope.floor.stores.length; i++){			
					if($rootScope.floor.stores[i]._id == id){    			
						$rootScope.floor.stores.splice(i, 1);
						break;
					}
		    	}
		    	
				// Update size
				$rootScope.floor.stores.size--; 		    	
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
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
		$rootScope.store = store;
    	
    	// Clone store for future rollback
    	$rootScope.storeClone = angular.copy(store); 
    	
    	// Get floor
    	$scope.floor = Floor.get({ _id: store.floorId }, function(floor){

			// Get store's floor					
			$scope.floor = floor;

			// Check is floor or basement
	    	if(floor.layer > 0)
	        	$scope.up = true;
	    	else
	        	$scope.up = false;

	        // Get floor's building
	        Building.get({ _id: floor.buildingId}, function(building){
	        	$scope.building = building;
	        })	    		

			// TODO: Select the floor in edit mode, we need to use setTimeout, since we have to render after dom is ready.
			setTimeout(function(){
				$("#store-floor option[value=" + store.floor + "]").attr("selected", "selected");
			}, 1000);

			$rootScope.loadingStore = false;
		});

    	$rootScope.$emit('storeFinishLoad', store);

    });
        
    // Include math library
	$scope.Math = window.Math;

    // Function for rollback selected user info
    $scope.cancelUpdateStore = function(){
        angular.copy($rootScope.storeClone, $rootScope.store);
    };
		
	// Function for update the basic fields
	$scope.updateStore = function(e){

        var store = this.store,
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

    		// Set floor value manually, since angularjs can't support two array select
    		store.floor = selectFloor.find(":selected").val();
    		selectFloor.attr('disabled', 'disabled');

    		// Update store
    		store.$save(function(store){

    			// Set back normal state of update button
    			updateButton.button('reset');

    			// Enable all input fields
    			inputFields.removeAttr('disabled');
                selectFloor.removeAttr('disabled');

				// Clone user info
		        $rootScope.storeClone = angular.copy(store);                

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.updateSuccess);	                		        
		        
    		}, function(responseText){

    			// Show error msg
    		    errorMsgObj.find(".errorText").text(responseText.msg);
    			errorMsgObj.show();

    			// Set back normal state of update button
    			updateButton.button('reset');

    			// Enable all input fields
    			inputFields.removeAttr('disabled');
                selectFloor.removeAttr('disabled');
               
    		});

        }

	};
	
	// Function for add new store
	$scope.uploadStoreImage = function(e){
		
		var store = this.store,
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
					
					// Update icon
					$scope.$apply(function () {
						store.icon = "/" + imagePath + "/" + res;
					});
					
					// Clone user info
			        $rootScope.storeClone = angular.copy(store); 
			        
			    	// Show success msg
					$().toastmessage('showSuccessToast', dialogInfo.uploadSuccess);				        
			        
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

// StoreListCtrl.$inject = ['$scope', 'Building'];