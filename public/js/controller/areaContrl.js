var utility = Utility.getInstance();

// List area controller
function AreaListCtrl($scope, Area, $compile, $rootScope, Poi) {

	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	
	
    // List all buildings
	$scope.loading = true;
	$scope.hasPagination = true;
	Area.list(function(obj){
		
		var page = obj.page,
			offset = obj.offset,
			count = obj.count,
			totalPages = Math.ceil(count/offset),
			areas = obj.areas;

		$scope.areas = areas;
		$scope.loading = false;

		// Set icon url
		areas.forEach(function(area){
			if(area.icon)
				area.icon = "/" + imagePath + "/" + area.icon;
			else
				area.icon = "/img/no-image.png";
		});		
		
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

		// Set area element droppable	
		$(document).on("DOMSubtreeModified", function(e){
			if(e &&e.target){				
				
				// Check the element is area element
				var tt = $(e.target).attr("class");
				if(tt && tt.indexOf("area-icon")!=-1){

					var ele = $(e.target).parent().parent();
					ele.droppable({
				      activeClass: "ui-state-default",
				      hoverClass: "ui-state-hover",
				      accept: ":not(.ui-sortable-helper)",
				      drop: function( e, ui ) {
				      	
				      	var areaId = e.target.id,
				      		areaName = $(e.target).find("a span").html(),
				      		poiId = ui.draggable.attr("id"),
				      		selectPoi = {};

				      	// Check come from copy or copy template and clone the POI	
				      	if(poiId.indexOf("copy-template")!=-1) {

				      		for(var i=0; i<$scope.copyPoiTemplateList.length; i++) {
				      			var tid = poiId.replace("copy-template-", "");
				      			if(tid == $scope.copyPoiTemplateList[i]._id){
				      				angular.copy($scope.copyPoiTemplateList[i], selectPoi);
				      				for(var key in selectPoi) {
				      					// Clean fields except name( name is necessary)
				      					if(typeof selectPoi[key]=="string" && key!="name") {
				      						selectPoi[key] = ""
				      					} else if(typeof selectPoi[key] == "object") {
				      						selectPoi[key] = [];
				      					}

				      					// Delete created time and updatedTime
				      					if(key == "createdTime" || key == "updatedTime")
				      						delete selectPoi[key];
				      				}
				      				break;
				      			}				      			
				      		}

				      	} else if(poiId.indexOf("copy")!=-1){

				      		for(var i=0; i<$scope.copyPoiList.length; i++) {
				      			var tid = poiId.replace("copy-", "");
				      			if(tid == $scope.copyPoiList[i]._id){
				      				angular.copy($scope.copyPoiList[i], selectPoi);
				      				break;
				      			}
				      		}

				      	}
				      	selectPoi.areaId = areaId;
				      	
				      	// Sync to server
				      	Poi.create(selectPoi, function(){

					    	// Show success msg
							$().toastmessage('showSuccessToast', "Copy POI to " +  areaName + " successfully");				

				      	}, function(res){

							// Show error msg
							var errorMsg = res && res.data && res.data.msg;
							$().toastmessage('showErrorToast', errorMsg);						        

				      	});

				      }
					});
				}
			}

		});

	});

	// Function for add new area
	$scope.addArea = function(e) {

		var addButton = angular.element(e.currentTarget),
		    form = addButton.parent(),
			inputs = form.find("input"),
			name = $(inputs[0]),
			errorMsgObj = form.find('.error-msg');

		// Clean error msg
		errorMsgObj.hide();
		errorMsgObj.find(".errorText").text("");

		// Check format
		if (utility.emptyValidate(name, errorMsgObj)) {

			// Disable all fields and buttons
			inputs.attr("disabled", "disabled");
			addButton.button('loading');

			// Create new area
			Area.create({

				name : name.val()
				
			}, function(area) {

				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				addButton.button("reset");

				// Update local buildings
				if(area.icon)
					area.icon = "/" + imagePath + "/" + area.icon;
				else
					area.icon = "/img/no-image.png";					
				$scope.areas.push(area);
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Create successfully");				

			}, function(res) {

				// Enable all fields and button
				inputs.removeAttr("disabled");
				addButton.button("reset");				

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg);						        

			});

		}

	};

	// Function for setup delete dialog
	var deleteObj,
		deleteModal = $("#deleteModal");
	$scope.deleteDialogSetup = function(){
		deleteObj = this.area;
		$("#removeContent").html(deleteObj.name);
		deleteModal.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal.modal('hide');
		
		// Delete store
		Area.delete({
			
			_id: deleteObj._id
			
		}, function(res){

			if(res._id){
				
				// Remove area from view
		    	var id = res._id;
		    	for(var i=0; i<$scope.areas.length; i++){			
					if($scope.areas[i]._id == id){    			
						$scope.areas.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove successfully");
				
			}			
			
		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

		});
		
	};

	// Function for load specific page
	$scope.loadPage = function(e, page){

		var element = angular.element(e.currentTarget);
		Area.list({ page: page }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				areas = obj.areas;
			$scope.areas = areas;

		});

	};

	// Get poi copy and copy template
	$scope.isAreaShowPage = false;
	if(window.location.toString().indexOf("/area/show")!=-1)
		$scope.isAreaShowPage = true;	
	Poi.getCopies(function(copyPoiList){
		$scope.copyPoiList = copyPoiList;
	});
	Poi.getCopyTemplates(function(copyPoiTemplateList){
		$scope.copyPoiTemplateList = copyPoiTemplateList;		
	});

	// Function for remove copy poi
	$scope.removeCopyPoi = function(e, poi, index){

		var poiId = angular.element(e.currentTarget).parent().parent().attr("id");
      	if(poiId.indexOf("copy-template")!=-1) {

      		Poi.removeCopyTemplate({ index: index }, function(copyPoi){

      			// Update copy poi list
      			$scope.copyPoiTemplateList = copyPoi;

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove copy poi successfully");

      		}, function(res) {

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg);						        

      		});

      	} else {

      		Poi.removeCopy({ index: index }, function(copyPoi){

      			// Update copy poi list
      			$scope.copyPoiList = copyPoi;

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Remove copy poi template successfully");

      		}, function(res) {

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg);						        
      			
      		});

      	}

	}
	
}

// Show specific area controller
function AreaShowCtrl($scope, $location, Area, $rootScope) {
	
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length) || $rootScope.selectedArea.id;	
	$scope.loadingArea = true;
	
	Area.get({ _id : id }, function(area){
		$scope.area = area;
		if(area.icon)
			area.icon = "/" + imagePath + "/" + area.icon;
		else
			area.icon = "/img/no-image.png";	    		
		$rootScope.$emit('areaFinishLoad', area);
        $rootScope.areaClone = angular.copy(area); // Clone area for future rollback        
    	$scope.loadingArea = false;

	});

    // Function for rollback selected user info
    $scope.cancelUpdateArea = function(){
        angular.copy($rootScope.areaClone, $scope.area);
    };

	// Function for update building
	$scope.updateArea = function(e) {

		var area = this.area,
			updateButton = angular.element(e.currentTarget),
			form = updateButton.parent(),
			inputFields = form.find("input");
			errorMsgObj = form.find(".error-msg"),
			utility = Utility.getInstance(),
			nameObj = form.find("input[name=name]"),
			descObj = form.find("textarea[name=desc]");

		if (utility.emptyValidate(nameObj, errorMsgObj)) {

			// Disable all fields before finish save
			inputFields.attr('disabled', 'disabled');
			descObj.attr('disabled', 'disabled');

			// Hide error msg block
			errorMsgObj.hide();

			// Set loading state of update button
			updateButton.button('loading');

			// Function for revert view
			function viewRevert(){

				// Set back normal state of update button
				updateButton.button('reset');

				// Enable all input fields
				inputFields.removeAttr('disabled');
				descObj.removeAttr('disabled');

			}

			area.$save( function(area){

				// Set back normal state of some fields
				viewRevert();

				// Clone user info
		        $rootScope.areaClone = angular.copy(area);

		    	// Show success msg
				$().toastmessage('showSuccessToast', "Update successfully");						        
		        
			}, function(res){

				// Set back normal state of some fields
				viewRevert();

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				errorMsgObj.find(".errorText").text(errorMsg);
				errorMsgObj.show();
				$().toastmessage('showErrorToast', errorMsg);						        

			});

		}

	};

	// Function for upload area image
	$scope.uploadAreaImage = function(e){

		var area = this.area,
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
					
				// Update area 
				$scope.$apply(function () {
					area.icon = "/" + imagePath + "/" + res;
					$rootScope.areaClone = angular.copy(area); // clone area						
				});
				
		    	// Show success msg
				$().toastmessage('showSuccessToast', "Upload successfully");									

				// Hide button
				uploadButton.button("reset");
				uploadButton.hide();
				return true;
			},
			error : function(res, status){

				// Hide button
				uploadButton.button("reset");

				// Show error msg
				var resText = ( res.responseJSON && res.responseJSON.msg ) || "Fail to upload image"
				$().toastmessage('showErrorToast', resText );		        

			},			

			clearForm : true

		};

		form.ajaxSubmit(options);

		return false;

	};
	
	// Function for package area mapzip
	$scope.packageMapzip = function(e){
		
		var area = this.area,
			updateButton = angular.element(e.currentTarget);
		
		updateButton.button('loading');
		Area.packageMapzip({
		
			_id: area._id 
				
		}, function(res){
						
			// Update info	
			area.mapzipUpdateTime = res.mapzipUpdateTime;

			// Reset button
			updateButton.button('reset');
			
	    	// Show success msg
			$().toastmessage('showSuccessToast', "Package successfully");							
			
		}, function(res){

			// Show error msg
			var resText = ( res.responseJSON && res.responseJSON.msg ) || "Fail to upload image"
			$().toastmessage('showErrorToast', resText );		        			

		});		
		
	};	
		
}

// AreaShowCtrl.$inject = ['$scope', 'Area'];
// AreaListCtrl.$inject = ['$scope', 'Area'];