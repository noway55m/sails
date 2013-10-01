var utility = Utility.getInstance();

// Controller for list stores
function AdListCtrl($scope, Ad, $rootScope) {

	$rootScope.$on('storeFinishLoad', function(e, store) {
		$scope.ads = Ad.list({ storeId: store._id });
	});

	// Function for update info fields
	$scope.updateAd = function(e){

		var ad = this.ad,
			updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			timeFields = form.find("input[data-provide=datepicker]"),
			utility = Utility.getInstance(),
			nameObj = form.find("input[name=name]"),
			priceObj = form.find("input[name=price]"),
			descObj = form.find("input[name=desc]");

		if (utility.emptyValidate(nameObj, errorMsgObj) &&
				utility.emptyValidate(priceObj, errorMsgObj) &&
				utility.emptyValidate(descObj, errorMsgObj)) {

			// Disable all fields before finish save
			inputFields.attr('disabled', 'disabled');

			// Hide error msg block
			errorMsgObj.hide();

			// Set loading state of update button
			updateButton.button('loading');

			// Set date fields, since angularjs not support
			ad.startTime = $(timeFields[0]).val();
			ad.endTime = $(timeFields[1]).val();

			ad.$save(function(ad){

				// Set back normal state of update button
				updateButton.button('reset');

				// Enable all input fields
				inputFields.removeAttr('disabled');

			}, function(res){

				// Show error msg
				errorMsgObj.find(".errorText").text(res.msg);
				errorMsgObj.show();

				// Set back normal state of update button
				updateButton.button('reset');

				// Enable all input fields
				inputFields.removeAttr('disabled');

			});

		}

	};

	// Function for update upload image
	$scope.uploadAdImage = function(e){

		var ad = this.ad,
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
						ad.image = res;
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

	};


	// Function for create new ad
	$scope.addAd = function(e){

		var addButton = angular.element(e.currentTarget),
			closeButton = addButton.prev(),
			closeButtonTop = addButton.parent().prev().prev().find(".close"),
			form = addButton.parent().prev(),
			inputFields = form.find("input"),
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			storeId = form.find("input[name=storeId]"),
			nameObj = form.find("input[name=name]"),
			priceObj = form.find("input[name=price]"),
			descObj = form.find("input[name=desc]");

		if (utility.emptyValidate(nameObj, errorMsgObj) &&
			utility.emptyValidate(priceObj, errorMsgObj) &&
			utility.emptyValidate(descObj, errorMsgObj)) {

			// Disable all fields
			inputFields.attr('disabled', 'disabled');

			// Disable all buttons
			addButton.button('loading');
			closeButton.hide();
			closeButtonTop.hide();

			// Hide error msg
			errorMsgObj.hide();

			// Create new ad
			Ad.create({

				storeId: storeId.val(),
				name: nameObj.val(),
				price: priceObj.val(),
				desc: descObj.val()

			}, function(res){

				// Enable all fields
				inputFields.removeAttr('disabled');

				// Enable all buttons
				addButton.button('reset');
				closeButton.show();
				closeButtonTop.show();

				if(res.msg){

					// Show error msg
					errorMsgObj.find(".errorText").text(res.msg);
					errorMsgObj.show();

				}else{

					// Push new record to ads
					$scope.ads.push(res);

					// Clean all fields and close dialog
					inputFields.val("");
					$('#add-ad-dialog').modal('hide');

				}

			});

		}

	};

}

// StoreListCtrl.$inject = ['$scope', 'Building'];
