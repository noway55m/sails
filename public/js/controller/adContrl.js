var utility = Utility.getInstance();

// Controller for list stores
function AdListCtrl($scope, Ad, $rootScope) {

	$rootScope.$on('storeFinishLoad', function(e, store) {
		
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
			
		});
		
		setTimeout(function(){
			datepickerSetup()
		}, 500);
		
	});
		
    // Function for rollback selected user info
    $scope.cancelUpdateAd = function(e){
    	
    	var form = angular.element(e.currentTarget).parent();
    	var id = angular.element(e.currentTarget).parent().attr('id');
    	for(var i=0; i<$rootScope.adsClone.length; i++){			
			if($rootScope.adsClone[i]._id == id){    			
		        angular.copy($rootScope.adsClone[i], $scope.ads[i]);		        
		        // Set start and end time manually, since not support while use datepicker.
		        form.find("input[name=startTime]").val($rootScope.adsClone[i].startTime);
		        form.find("input[name=endTime]").val($rootScope.adsClone[i].endTime);		        
			}
    	}
    	
    };	
	
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
				
				// Clone ad
		    	var id = ad._id;
		    	for(var i=0; i<$rootScope.adsClone.length; i++){			
					if($rootScope.adsClone[i]._id == id)    			
						$rootScope.adsClone[i] = angular.copy(ad); 			    		    		
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Update successfully");		    	
				
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
					
					// Update image
					$scope.$apply(function () {
						ad.image = "/" + imagePath + "/" + res;
					});
					
					// Clone ad
			    	var id = ad._id;
			    	for(var i=0; i<$rootScope.adsClone.length; i++){			
						if($rootScope.adsClone[i]._id == id)    			
							$rootScope.adsClone[i] = angular.copy(ad); 			    		    		
			    	}
			    	
			    	// Show success msg
					$().toastmessage('showSuccessToast', "Upload successfully");			    	
					
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

				storeId: $rootScope.store._id,
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
					$rootScope.adsClone.push(res);

					// Clean all fields and close dialog
					inputFields.val("");
					form.parent().parent().parent().modal('hide');

			    	// Show success msg
					$().toastmessage('showSuccessToast', "Create successfully");					
					
				}

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
