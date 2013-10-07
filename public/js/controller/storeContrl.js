var utility = Utility.getInstance();

// Controller for list stores
function StoreListCtrl($scope, Store, $scope, $rootScope) {

	// Load floor after building finish load
	$rootScope.$on('floorFinishLoad', function(e, floor) {
		Store.list({
			floorId : floor._id
		}, function(stores) {
			$rootScope.floor.stores = stores;
			$rootScope.floor.stores.size = stores.length;
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
		$rootScope.floors[j].stores = Store.list({
			floorId: $scope.selectedFloor
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
	
				if(res.msg){
	
					// Show error msg
					errorMsgObj.find(".errorText").text(res.msg);
					errorMsgObj.show();
	
				}else{
					
					// add new store
					$rootScope.floor.stores.push(res);
					
					// Clean all fields and close dialog
					inputFields.val("");
					form.parent().parent().parent().modal('hide');
					
				}
	
			});
	
		}		
				
	}; 	
	
}

// Controller for show specific store
function StoreShowCtrl($scope, $location, Store, $rootScope, Building, Floor){

    // Get store info and floor info
    var url = $location.absUrl(),
    	id = url.substring(url.lastIndexOf("/") + 1, url.length);
    $rootScope.store = Store.get({ _id : id }, function(store){
    	
    	// Clone store for future rollback
    	$rootScope.storeClone = angular.copy(store); 
    	
    	// Get floor
    	$scope.floor = Floor.get({ _id: store.floorId }, function(floor){

           	// Get floors of building
        	Floor.list({ buildingId: floor.buildingId }, function(floors){
        		
        		// Differentiate floor and basement
        		$scope.floorUp = [];
        		$scope.floorDown = [];
    			floors.forEach(function(floor){
    				
    				if(floor.layer > 0 )
    					$scope.floorUp.push(floor);
    				else
    					$scope.floorDown.push(floor);
    				
    				if(floor._id == store.floorId){					
    			    	
    					// Get store's floor					
    					$scope.floor = floor;
    					
    					// Check is floor or basement
    			    	if(store.floor > 0)
    			        	$scope.up = true;
    			    	else
    			        	$scope.up = false;
    			    	
    				}
    				
    			});           		        		
    		
        	});
    	

			// TODO: Select the floor in edit mode, we need to use setTimeout, since we have to render after dom is ready.
			setTimeout(function(){
				$("#store-floor option[value=" + store.floor + "]").attr("selected", "selected");
			}, 1000);

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
					// imgTag.attr("src", ad.image);
					$scope.$apply(function () {
						store.icon = res;
					});
					// Clone user info
			        $rootScope.storeClone = angular.copy(store);                					
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