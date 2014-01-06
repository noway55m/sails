var utility = Utility.getInstance();

// Controller for list stores
function UserListCtrl($scope, User, $rootScope, $compile) {

	// List all users
	User.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			users = obj.users;

		$rootScope.count = count;	
		$rootScope.users = users;
		$scope.loading = false;

		// Trigger pagination		
		if( totalPages > 1 ) {

			$scope.hasPagination = false;
			$("#pagination").paginate({
				count: totalPages,
				start: 1,
				display: 5,
				border: false,
				text_color: '#79B5E3',
				background_color: 'none',	
				text_hover_color: '#2573AF',
				background_hover_color: 'none',
				mouse: 'press'
			});
			$compile( angular.element('#pagination').contents() )($scope);

		}

	});	

	// Function for select specific user
	$scope.selectUser = function(user){
		$rootScope.selectedUser = user;
		$rootScope.selecedtUserClone = angular.copy($rootScope.selectedUser); // Clone user for future rollback
	};

	// Function for create new user
	$scope.addUser = function(e){

		var addButton = angular.element(e.currentTarget),
			form = addButton.parent(),
			inputFields = form.find("input"),
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			usernameObj = form.find("input[name=username]"),
			passwordObj = form.find("input[name=password]"),
			roleObj = form.find("select");

		if (utility.emptyValidate(usernameObj, errorMsgObj) &&
			utility.passwordValidate(passwordObj, errorMsgObj)) {

			// Disable all fields
			inputFields.attr('disabled', 'disabled');

			// Disable all buttons
			addButton.button('loading');

			// Hide error msg
			errorMsgObj.hide();

			// Create new ad
			User.create({

				username: usernameObj.val(),
				password: passwordObj.val(),
				role: roleObj.val()

			}, function(res){

				// Enable all fields and clean
				inputFields.removeAttr('disabled').val("");

				// Enable all buttons
				addButton.button('reset');

				// Push new record to users
				$rootScope.users.push(res);

				// count ++
				$rootScope.count++;

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(err){

				// Enable all fields
				inputFields.removeAttr('disabled');

				// Enable all buttons
				addButton.button('reset');

		    	// Show error msg
		    	var errMsg = ( err && err.data && err.data.msg ) || "Server error, please try again later"; 
				$().toastmessage('showErrorToast', errMsg);				

			});

		}

	};
	
	// Cancel for update user	
	$scope.cancelUpdateUser = function(){

		// Hide all error msg
		$("#user-edit-dialog").find(".error-msg").css("display", "none");

		// Revert original value
		angular.copy($rootScope.selecedtUserClone, $rootScope.selectedUser);					

	};

    // Function for update user info
	$scope.updateUser = function(e, selectedUser){

	    // Clone user info
	    $rootScope.selecedtUserClone = angular.copy($rootScope.selectedUser);

	    var user = this.user || selectedUser,
	    	updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			roleObj = form.find("select");


		// Disable all fields before finish save
		inputFields.attr('disabled', 'disabled');

		// Hide error msg block
		errorMsgObj.hide();

		// Set loading state of update button
		updateButton.button('loading');

		// Set date fields, since angularjs not support
		User.save( user, function(user){

			// Update user
			$rootScope.selectedUser.token = user.token;
			$rootScope.selecedtUserClone = angular.copy($rootScope.selectedUser);

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

	    	// Show success msg
			$().toastmessage('showSuccessToast', "Create successfully");				

		}, function(err){

			// Show error msg
		    var errMsg = ( err && err.data && err.data.msg ) || "Server error, please try again later"; 
			errorMsgObj.find(".errorText").text(errMsg);
			errorMsgObj.show();

			// Set back normal state of update button
			updateButton.button('reset');

			// Enable all input fields
			inputFields.removeAttr('disabled');

	    	// Show error msg
	    	var errMsg = ( err && err.data && err.data.msg ) || "Server error, please try again later"; 
			$().toastmessage('showErrorToast', errMsg);				

		});

	};

	// Function for change password of user
	$scope.changePassword = function(e, selectedUser){

		var user = this.user || selectedUser,
			changeButton = angular.element(e.currentTarget),
			closeButton = changeButton.prev(),
			closeButtonTop = changeButton.parent().prev().prev().find(".close"),
			form = changeButton.parent().prev(),
			errorMsgObj = form.find(".error-msg"),
			passwordObj = form.find("input[name=password]");

		if (utility.passwordValidate(passwordObj, errorMsgObj)) {

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

				_id: user._id,
				password: passwordObj.val()

			}, function(res){

				// Enable all fields
				passwordObj.removeAttr('disabled');

				// Enable all buttons
				changeButton.button('reset');
				closeButton.show();
				closeButtonTop.show();

				// Clean all fields and close dialog
				passwordObj.val("");

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(res){ 

				// Enable all fields
				passwordObj.removeAttr('disabled');

				// Enable all buttons
				changeButton.button('reset');
				closeButton.show();
				closeButtonTop.show();

				// Show error msg
				var errMsg = ( res && res.data && res.data.msg ) || "Server error, please try again later"; 				
				errorMsgObj.find(".errorText").text(res.msg);
				errorMsgObj.show();
				$().toastmessage('showErrorToast', errMsg);				

			});

		}

	};

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(user){
		deleteObj = user;		
		$("#removeContent").html(deleteObj.username);
		deleteModal.modal("show");
	};

	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		User.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	for(var i=0; i<$rootScope.users.length; i++){			
					if($scope.users[i]._id == id){    			
						$scope.users.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		}, function(res){

	    	// Show error msg
	    	var errMsg = ( res && res.data && res.data.msg ) || "Server error, please try again later"; 
			$().toastmessage('showErrorToast', errMsg);				

		});
		
	};	

	// Function for load specific page
	$scope.loadPage = function(e, page){

		var element = angular.element(e.currentTarget);
		User.list({ page: page }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				users = obj.users;

			$rootScope.users = users;

		});

	};

}

// StoreListCtrl.$inject = ['$scope', 'Building'];
