var utility = Utility.getInstance();

// REST Setup
angular.module('storeServices', [ 'ngResource' ]).factory('Store', function($resource) {

	return $resource('/user/store/:action/:id', { id : "@id" }, {

		get : {
			method : 'GET',
			params : {
				action : 'read'
			}
		},

		create : {
			method : 'POST',
			params : {
				action : 'create'
			}
		},

		save : {
			method : 'POST',
			params : {
				action : 'update'
			}
		},

		"delete" : {
			method : 'POST',
			params : {
				action : 'delete'
			}
		},

		list : {
			method : 'GET',
			params : {
				action : 'list'
			},
			isArray : true
		}

	});

});

// Controller for list stores
function StoreListCtrl($scope, Store, $rootScope) {

	// Show stores while floor collapse open
	$(".floor").on("shown.bs.collapse", function(){

		// Get current select floor
		$scope.currentSelectedFloor = this.id.replace("layer", "");
		var j = 0;
		for(var i=0; i<$rootScope.floors.length; i++){
			if($rootScope.floors[i].layer == $scope.currentSelectedFloor){
				j = i;
				break;
			}
		}

		$rootScope.floors[j].stores = Store.list({
			buildingId: $rootScope.building._id,
    		floor: $scope.currentSelectedFloor
		});

		// Set current selected floor on field floor
		$("#add-store-form select option[value=" + $scope.currentSelectedFloor + "]").attr("selected", "selected");

	});

}

// Controller for show specific store
function StoreShowCtrl($scope, $location, Store, $rootScope, Building, Floor){

    // Get store info and floor info
    var url = $location.absUrl(),
    id = url.substring(url.lastIndexOf("/") + 1, url.length);
    $scope.store = Store.get({ id : id }, function(store){
    	if(store.floor > 0)
        	$scope.up = true;
    	else
        	$scope.up = false;
    	//store.floor = store.floor.toString();
    	$scope.building = Building.get({ id: store.buildingId});
    	Floor.list({ buildingId: store.buildingId }, function(floors){
    		$scope.floorUp = [];
    		$scope.floorDown = [];
			floors.forEach(function(floor){
				if(floor.layer > 0 )
					$scope.floorUp.push(floor);
				else
					$scope.floorDown.push(floor);
			});

			// TODO: Select the floor in edit mode, we need to use setTimeout, since we have to render after dom is ready.
			setTimeout(function(){
				$("#store-floor option[value=" + store.floor + "]").attr("selected", "selected");
			}, 1000);

		});

    	$rootScope.$emit('storeFinishLoad', store);

    });
	$scope.Math = window.Math;

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

}

// Ajax submit for add new store (add-store-dialog.html)
function addStore(){
	//var textFields = $('#add-store-form :text').fieldValue();

	// Ajax from setup
	var utility = Utility.getInstance();
	var options = {

		beforeSend : function(){ // pre-submit callback

			// Disable all fields
			$("#add-store-form input").attr('disabled', 'disabled');

			// Hide error msg
			$("#add-store-dialog-error-msg").hide();
			return true;

		},
		uploadProgress : function(event, position, total, percent){},
		success : function(responseText, statusText){ // post-submit callback

			// Show error msg
			if(responseText.msg){
				$("#add-store-dialog-error-msg .errorText").text(responseText.msg);
				$("#add-store-dialog-error-msg").show();
				// Enable all fields
				$("#add-store-form input").removeAttr('disabled');
			}else{
				window.location = "/user/store/show/" + responseText._id;
			}
		},

		// other available options:
		clearForm : true, // clear all form fields after successful submit
	};
	var errorMsg = $("#add-store-dialog-error-msg"),
		nameObj = $("#add-store-form input[name=name]"),
		phoneObj = $("#add-store-form input[name=phone]"),
		memoObj = $("#add-store-form input[name=memo]"),
		linkObj = $("#add-store-form input[name=link]");
	if (utility.emptyValidate(nameObj, errorMsg) && utility.emptyValidate(phoneObj, errorMsg) &&
			utility.emptyValidate(memoObj, errorMsg) && utility.emptyValidate(linkObj, errorMsg)) {
		$('#add-store-form').ajaxSubmit(options);
	}

 return false;

};

// Ajax submit for update store's image (index.html)
function uploadImage(){

	// Ajax from setup
	var options = {

		beforeSend : function(){ // pre-submit callback
			$("#image-form input").attr('disabled');
			$("#image-upload-error-dialog").hide();
			return true;
		},
		uploadProgress : function(event, position, total, percent){ // upload progress callback

		},
		success : function(responseText, statusText){ // post-submit callback
			// Show error msg
			if(responseText.msg){
				$("#image-upload-error-dialog .errorText").text(responseText.msg);
				$("#image-upload-error-dialog").show();
			}else{
				$("#edit-store-icon").attr("src", responseText);
			}

			// Hide button
			$("#edit-store-button-save-imag").hide();
			return true;
		},

		// other available options:
		clearForm : true,

	};
	$('#image-form').ajaxSubmit(options);

	return false;
}

// StoreListCtrl.$inject = ['$scope', 'Building'];
