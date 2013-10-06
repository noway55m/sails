var utility = Utility.getInstance();

// List buildings controller
function BuildingListCtrl($scope, Building) {

	$scope.buildings = Building.list();
	$scope.addBuilding = function(d) {

		var addBlock = "#add-building-block",
			inputs = $(addBlock + " input"),
			buttons = $(addBlock + " button"),
			name = $(inputs[0]),
			desc = $(inputs[1]),
			errorMsgObj = $("#error-dialog");

		// Clean error msg
		errorMsgObj.css({
			display : "none"
		});
		errorMsgObj.children(".errorText").html("");

		// Check format
		if (utility.emptyValidate(name, errorMsgObj)) {

			// Disable all fields and buttons
			inputs.attr("disabled", "disabled");
			buttons.button('loading');

			// Create new building
			Building.create({

				name : name.val(),
				desc : desc.val()

			}, function(data) {

				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				buttons.button("reset");

				// Update local buildings
				$scope.buildings.push(data.building);

			}, function(err) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				buttons.removeAttr("disabled");

			});

		}

	}

}

// Show specific building controller
function BuildingShowCtrl($scope, $location, Building, $rootScope) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length);
	$scope.building = Building.get({ _id : id }, function(building){
		$rootScope.$emit('buildingFinishLoad', building);
	});

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

			building.$save( function(){

				// Set back normal state of update button
				updateButton.button('reset');

				// Enable all input fields
				inputFields.removeAttr('disabled');
				descObj.removeAttr('disabled');


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

			clearForm : true,

		};

		form.ajaxSubmit(options);

		return false;

	}


}


// BuildingShowCtrl.$inject = ['$scope', 'Building'];
