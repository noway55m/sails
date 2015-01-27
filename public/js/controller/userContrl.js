var utility = Utility.getInstance();

function UserShowCtrl($scope, User, $rootScope) {	
	
	$scope.user = User.get({ _id: userId });	
	
	var cpForm = $("#change-password-form"),
		cpButton = $("#changePasswordButton"),
		udForm = $("#upgrade-developer-form"),
		udButton = $("#upgradeDeveloperButton");
	
	// Control change password block
	$scope.showChangePasswordBlock = function(){
		cpButton.fadeOut();
		cpForm.fadeIn();		
	};
	$scope.hideChangePasswordBlock = function(){
		cpForm.fadeOut();
		cpButton.fadeIn();
	};

	// Change password check
	$scope.changePassword = function(e){
		
		var changeButton = angular.element(e.currentTarget),
			closeButton = changeButton.prev(),
			inputFields = cpForm.find("input"),
			passwordObj = cpForm.find("input[name=password]"),			
			npasswordObj = cpForm.find("input[name=newPassword]"),
			cfpasswordObj = cpForm.find("input[name=confirmPassword]"),
			errorMsgObj = cpForm.find(".error-msg");
		
		if (utility.passwordValidate(passwordObj, errorMsgObj) &&				
			utility.passwordValidate(npasswordObj, errorMsgObj) &&
			utility.newPasswordValidate(npasswordObj, cfpasswordObj, errorMsgObj)) {
				
			// Disable all fields
			inputFields.attr('disabled', 'disabled');	

			// Disable all buttons
			changeButton.button('loading');
			closeButton.hide();

			// Hide error msg
			errorMsgObj.hide();			
						
			// Change user's password
			User.changePassword({
	
				_id: $scope.user._id,
				password: passwordObj.val(),
				npassword: npasswordObj.val()
				
			}, function(res){
	
				// Enable all fields
				inputFields.removeAttr('disabled');
				
				// Enable all buttons
				changeButton.button('reset');
				closeButton.show();
	
				// Clean all fields and close dialog
				inputFields.val("");
				$scope.hideChangePasswordBlock();
				$().toastmessage('showSuccessToast', dialogInfo.changeSuccess);
	
			}, function(res){

				// Enable all fields
				inputFields.removeAttr('disabled');
				
				// Enable all buttons
				changeButton.button('reset');
				closeButton.show();

				// Show error msg
				var errMsg = ( res && res.data && res.data.msg ) || "Server error, please try again later"; 				
				errorMsgObj.find(".errorText").text(errMsg);
				errorMsgObj.show();
		    	$().toastmessage('showErrorToast', errMsg);				

			});			
						
		}	
		
	};
	
	
	// Control upgrade developer block
	$scope.showUpgradeDeveloperBlock = function(){
		udButton.fadeOut();
		udForm.fadeIn();		
	};
	$scope.hideUpgradeDeveloperBlock = function(){
		udForm.fadeOut();
		udButton.fadeIn();
	};
	
	// Upgrade developer
	$scope.upgradeDeveloper = function(e){
		
		var informButton = angular.element(e.currentTarget),
			closeButton = informButton.prev(),
			emailObj = udForm.find("input[name=email]"),
			msgObj = udForm.find("textarea[name=msg]"),			
			errorMsgObj = udForm.find(".error-msg");
		
		if (utility.emailValidate(emailObj, errorMsgObj) &&				
			utility.emptyValidate(msgObj, errorMsgObj)) {
				
			// Disable all fields
			emailObj.attr('disabled', 'disabled');	
			msgObj.attr('disabled', 'disabled');	
			
			// Disable all buttons
			informButton.button('loading');
			closeButton.hide();
	
			// Hide error msg
			errorMsgObj.hide();			
						
			// Change user's password
			User.upgradeDeveloper({
	
				_id: $scope.user._id,
				email: emailObj.val(),
				msg: msgObj.val()
				
			}, function(res){
	
				// Enable all fields
				emailObj.removeAttr('disabled');
				msgObj.removeAttr('disabled');
				
				// Enable all buttons
				informButton.button('reset');
				closeButton.show();
	
				if(res.msg){
	
					// Show error msg
					errorMsgObj.find(".errorText").text(res.msg);
					errorMsgObj.show();
	
				}else{
	
					// Clean all fields and close dialog
					emailObj.val("");
					msgObj.val("");
					$().toastmessage('showSuccessToast', dialogInfo.receiveRequest);
				}
	
			});			
						
		}			
		
	};
	
}


// StoreListCtrl.$inject = ['$scope', 'Building'];
