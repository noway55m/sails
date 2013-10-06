var utility = Utility.getInstance();

// List buildings controller
function BuildingListCtrl($scope, Building) {

    // List all buildings
	$scope.buildings = Building.list();

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
				$scope.buildings.push(building);

			}, function(err) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				addButton.removeAttr("disabled");

			});

		}

	};

}

// Show specific building controller
function BuildingShowCtrl($scope, $location, Building, $rootScope) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length);
	$scope.building = Building.get({ _id : id }, function(building){
	    $rootScope.$emit('buildingFinishLoad', building);
        $rootScope.buildingClone = angular.copy(building); // Clone user for  future rollback
	});

    // Function for rollback selected user info
    $scope.cancelUpdateBuilding = function(){
        console.log('sdlfjsldfj')
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

		if (utility.emptyValidate(nameObj, errorMsgObj) && utility.emptyValidate(descObj, errorMsgObj)) {

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

				// Clone user info
		        $rootScope.buildingClone = angular.copy(building);

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
					// imgTag.attr("src", ad.image);
					$scope.$apply(function () {
						building.icon = res;
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


}


// BuildingShowCtrl.$inject = ['$scope', 'Building'];
