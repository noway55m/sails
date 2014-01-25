var utility = Utility.getInstance();

// Controller for list stores
function AdListCtrl($scope, Ad, $rootScope) {

	$rootScope.$on('storeFinishLoad', function(e, store) {
		
		$rootScope.loadingAd = true;
		Ad.list({
			storeId : store._id
		}, function(ads) {
			
			ads.forEach(function(ad){
				if(ad.image)
					ad.image = "/" + imagePath + "/" + ad.image;
				else
					ad.image = "/img/no-image.png";	
			});
			$scope.ads = ads;
			$rootScope.adsClone = angular.copy(ads);	// Clone ads for future rollback
			$rootScope.loadingAd = false;
		});
		
		setTimeout(function(){
			datepickerSetup()
		}, 500);
		
	});
		
	// Function for select
	$scope.selectAd = function(obj){
		$rootScope.selectedAd = obj;
		$rootScope.selectedAdClone = angular.copy($rootScope.selectedAd); // Clone selected for future rollback
	};	

    // Function for rollback selected user info
    $scope.cancelUpdateAd = function(e){

    	var form = angular.element(e.currentTarget).parent();
    	angular.copy($rootScope.selectedAdClone, $rootScope.selectedAd);

        // Set start and end time manually, since not support while use datepicker.
        form.find("input[name=startTime]").val($rootScope.selectedAdClone.startTime);
        form.find("input[name=endTime]").val($rootScope.selectedAdClone.endTime);
    	
    };	
	
	// Function for update info fields
	$scope.updateAd = function(e, selectedAd){

		var ad = selectedAd,
			updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			timeFields = form.find("input[data-provide=datepicker]"),
			utility = Utility.getInstance(),
			nameObj = form.find("input[name=name]"),
			priceObj = form.find("input[name=price]"),
			descObj = form.find("textarea[name=desc]");

		if (utility.emptyValidate(nameObj, errorMsgObj) &&
			utility.floatValidate(priceObj, errorMsgObj) &&
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
				
				// Clone ad
				if(ad.image)
					ad.image = "/" + imagePath + "/" + ad.image;
				else
					ad.image = "/img/no-image.png";					
				$rootScope.selectedAdClone = angular.copy(ad); 

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

	};

	// Function for update upload image
	$scope.uploadAdImage = function(e, selectedAd){

		var ad = selectedAd,
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
					
				// Update image
				$scope.$apply(function () {
					ad.image = "/" + imagePath + "/" + res;
				});

				// Clone ad	
				$rootScope.selectedAdClone = angular.copy(ad);		
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload successfully");			    	
				
				// Hide button
				uploadButton.button("reset");
				uploadButton.hide();
				return true;
			},

			error : function(res, status){

				// Enable buttion
				uploadButton.button("reset");

				// Show error msg
				var resText = ( res.responseJSON && res.responseJSON.msg ) || "Fail to upload image"
				$().toastmessage('showErrorToast', resText );	        

			},	

			clearForm : true,

		};

		form.ajaxSubmit(options);

		return false;

	};


	// Function for create new ad
	$scope.addAd = function(e){

		var addButton = angular.element(e.currentTarget),
			form = addButton.parent(),
			inputFields = form.find("input"),
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			nameObj = form.find("input[name=name]"),
			priceObj = form.find("input[name=price]"),
			descObj = form.find("input[name=desc]");

		if (utility.emptyValidate(nameObj, errorMsgObj) &&
			utility.floatValidate(priceObj, errorMsgObj) &&
			utility.emptyValidate(descObj, errorMsgObj)) {

			// Disable all fields
			inputFields.attr('disabled', 'disabled');

			// Disable all buttons
			addButton.button('loading');

			// Hide error msg
			errorMsgObj.hide();

			// Create new ad
			Ad.create({

				storeId: $rootScope.selectedStore._id,
				name: nameObj.val(),
				price: priceObj.val(),
				desc: descObj.val()

			}, function(res){

				// Enable all fields
				inputFields.removeAttr('disabled');

				// Enable all buttons
				addButton.button('reset');

				// Push new record to ads
				res.image = "/img/no-image.png";	
				$scope.ads.push(res);
				$rootScope.adsClone.push(res);

				// Clean all fields and close dialog
				inputFields.val("");

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");					
									
			}, function(res){

				// Enable all fields
				inputFields.removeAttr('disabled');

				// Enable all buttons
				addButton.button('reset');

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
		deleteObj = this.ad;
		$("#removeContent").html(deleteObj.name);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete ad
		Ad.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove ad from view
		    	var id = res._id;
		    	for(var i=0; i<$rootScope.adsClone.length; i++){			
					if($rootScope.adsClone[i]._id == id){    			
						$rootScope.adsClone.splice(i, 1);
						$scope.ads.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			errorMsgObj.find(".errorText").text(errorMsg);
			errorMsgObj.show();
			$().toastmessage('showErrorToast', errorMsg);

		});
		
	};

}

// Function for setup datepicker
function datepickerSetup(){
	
	console.log('kddlfsajflsdfjl')
	var nowTemp = new Date();
	var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	 
	var checkin = $('.startDate').datepicker({
	  onRender: function(date) {
	    return date.valueOf() < now.valueOf() ? 'disabled' : '';
	  }
	}).on('changeDate', function(ev) {
	  if (ev.date.valueOf() > checkout.date.valueOf()) {
	    var newDate = new Date(ev.date)
	    newDate.setDate(newDate.getDate() + 1);
	    checkout.setValue(newDate);
	  }
	  checkin.hide();
	  $('.endDate')[0].focus();
	}).data('datepicker');
	var checkout = $('.endtDate').datepicker({
	  onRender: function(date) {
	    return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
	  }
	}).on('changeDate', function(ev) {
	  checkout.hide();
	}).data('datepicker');	
	
}

// StoreListCtrl.$inject = ['$scope', 'Building'];
