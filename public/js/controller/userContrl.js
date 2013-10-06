var utility = Utility.getInstance();

// Controller for list stores
function UserListCtrl($scope, User, $rootScope) {

	// List all users
	$rootScope.users = User.list();

	// Function for select specific user
	$scope.selectUser = function(user){
		$rootScope.selecedtUser = user;
		$rootScope.selecedtUserClone = angular.copy($rootScope.selecedtUser); // Clone user for future rollback
	};

	// Function for create new user
	$scope.addUser = function(e){
		var addButton = angular.element(e.currentTarget),
			closeButton = addButton.prev(),
			closeButtonTop = addButton.parent().prev().prev().find(".close"),
			form = addButton.parent().prev(),
			inputFields = form.find("input"),
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			usernameObj = form.find("input[name=username]"),
			passwordObj = form.find("input[name=password]"),
			roleObj = form.find("select");

		if (utility.emptyValidate(usernameObj, errorMsgObj) &&
			utility.emptyValidate(passwordObj, errorMsgObj)) {

			// Disable all fields
			inputFields.attr('disabled', 'disabled');

			// Disable all buttons
			addButton.button('loading');
			closeButton.hide();
			closeButtonTop.hide();

			// Hide error msg
			errorMsgObj.hide();

			// Create new ad
			User.create({

				username: usernameObj.val(),
				password: passwordObj.val(),
				role: roleObj.val()

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

					// Push new record to users
					$rootScope.users.push(res);

					// Clean all fields and close dialog
					inputFields.val("");
					form.parent().parent().parent().modal('hide');

				}

			});

		}

	};

	// Function for rollback selected user info
	$scope.cancelUpdateUser = function(){
	    angular.copy($rootScope.selecedtUserClone, $rootScope.selecedtUser);
	};

    // Function for update user info
	$scope.updateUser = function(e){

	    // Clone user info
	    $rootScope.selecedtUserClone = angular.copy($rootScope.selecedtUser);

	    var updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			timeFields = form.find("input[data-provide=datepicker]"),
			utility = Utility.getInstance(),
			roleObj = form.find("select");


		// Disable all fields before finish save
		inputFields.attr('disabled', 'disabled');

		// Hide error msg block
		errorMsgObj.hide();

		// Set loading state of update button
		updateButton.button('loading');

		// Set date fields, since angularjs not support
		$rootScope.selecedtUser.$save(function(ad){

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

			// Clean all fields and close dialog
			form.parent().parent().parent().modal('hide');


		}, function(res){

			// Show error msg
			errorMsgObj.find(".errorText").text(res.msg);
			errorMsgObj.show();

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

		});

	};

	// Function for change password of user
	$scope.changePassword = function(e){
		var changeButton = angular.element(e.currentTarget),
			closeButton = changeButton.prev(),
			closeButtonTop = changeButton.parent().prev().prev().find(".close"),
			form = changeButton.parent().prev(),
			errorMsgObj = form.find(".error-msg"),
			passwordObj = form.find("input[name=password]");

		if (utility.emptyValidate(passwordObj, errorMsgObj)) {

			// Disable all fields
			passwordObj.attr('disabled', 'disabled');

			// Disable all buttons
			changeButton.button('loading');
			closeButton.hide();
			closeButtonTop.hide();

			// Hide error msg
			errorMsgObj.hide();

			// Change user's password
			User.changePassword({

				_id: $rootScope.selecedtUser._id,
				password: passwordObj.val()

			}, function(res){

				// Enable all fields
				passwordObj.removeAttr('disabled');

				// Enable all buttons
				changeButton.button('reset');
				closeButton.show();
				closeButtonTop.show();

				if(res.msg){

					// Show error msg
					errorMsgObj.find(".errorText").text(res.msg);
					errorMsgObj.show();

				}else{

					// Clean all fields and close dialog
					passwordObj.val("");
					form.parent().parent().parent().modal('hide');

				}

			});

		}

	};


}

// StoreListCtrl.$inject = ['$scope', 'Building'];
