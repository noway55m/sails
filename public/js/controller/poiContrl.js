var utility = Utility.getInstance();

// List poi controller
function PoiListCtrl($scope, Building, $compile, $rootScope, Poi) {

	// Show and hide remove button
	$scope.showRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").show();
	};
	
	$scope.hideRemoveButton = function(e){
		angular.element(e.currentTarget).find(".remove-button-list").hide();		
	};	
	
    // List all pois
	$scope.loading = true;
	$scope.hasPagination = true;

	// Load floor after building finish load
	$rootScope.$on('buildingFinishLoad', function(e, building) {

		$scope.building = building;
		Poi.list({ buildingId: building._id }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				totalPages = Math.ceil(count/offset),
				pois = obj.pois;

			$scope.pois = pois;
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

			// Setup tooltip
			setTimeout(function(){
				tooltipSetup();
			}, 500);

		});

	});

	// Function for add new poi
	$scope.addPoi = function(e) {

		var addButton = angular.element(e.currentTarget),
		    form = addButton.parent().prev(),
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

			// Create new poi
			Poi.create({

				name : name.val(),
				buildingId : $scope.building._id

			}, function(poi) {

				// Enable all fields and button
				inputs.removeAttr("disabled").val("");
				addButton.button("reset");
				
				// Close dialog
				$("#add-poi-dialog").modal("hide");

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.createSuccess);				

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
	var deleteObj3,
		deleteModal3 = $("#deleteModalPoi");	
	$scope.deleteDialogSetup = function(e){
		deleteObj3 = this.poi;
		deleteModal3.find(".removeContent").html(deleteObj3.name);
		deleteModal3.modal("show");
	};
	
	// Function for delete ad obj
	$scope.deleteObj = function(e){
		
		// Hide modal
		deleteModal3.modal('hide');

		// Delete poi
		Poi.delete({
			
			_id: deleteObj3._id
			
		}, function(res){

			if(res._id){
				
				// Remove store from view
		    	var id = res._id;
		    	for(var i=0; i<$scope.pois.length; i++){			
					if($scope.pois[i]._id == id){    			
						$scope.pois.splice(i, 1);
						break;
					}
		    	}
		    	
		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);
				
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
		Poi.list({ page: page }, function(obj){
			
			var page = obj.page,
				offset = obj.offset,
				count = obj.count,
				pois = obj.pois;

			$scope.pois = pois;

		});

	};

	// Get poi copy and copy template
	$scope.isBuildingShowPage = false;
	if(window.location.toString().indexOf("/building/show")!=-1)
		$scope.isBuildingShowPage = true;		
	Poi.getCopies(function(copyPoiList){
		$scope.copyPoiList = copyPoiList;
	});
	Poi.getCopyTemplates(function(copyPoiTemplateList){
		$scope.copyPoiTemplateList = copyPoiTemplateList;		
	});


	// Function for load specific page		
	$scope.copyPoi = function(e){
		copyPoi(e, $scope, Poi, this.poi);
	}

	// Function for load specific page	
	$scope.copyPoiTemplate = function(e, poi){
		copyPoiTemplate(e, $scope, Poi, this.poi);		
	}

	// Function for copy on current building
	$scope.copyPoiHere = function(e, poi){

      	var buildingId = $scope.building._id,
      		buildingName = $scope.building.name,
      		poiId = angular.element(e.currentTarget).parent().parent().attr("id"),
      		selectPoi = {};

      	// Check come from copy or copy template and clone the POI
     	angular.copy(poi, selectPoi);      		
      	if(poiId.indexOf("copy-template")!=-1) {
			for(var key in selectPoi) {
				console.log(typeof selectPoi[key]);
				if(typeof selectPoi[key] == "string" && key != "name") {
					selectPoi[key] = ""
				} else if(typeof selectPoi[key] == "object") {
					selectPoi[key] = [];
				}
			}
      	}
      	selectPoi.buildingId = buildingId;
      	Poi.create(selectPoi, function(thePoi){

      		// Update poi list
			$scope.pois.push(thePoi);
	    	
	    	// Show success msg
			$().toastmessage('showSuccessToast', dialogInfo.copyPoiToSuccess + " " +  buildingName);				

      	}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg);						        

      	});

	}

	// Function for remove copy poi
	$scope.removeCopyPoi = function(e, poi, index){

		var poiId = angular.element(e.currentTarget).parent().parent().attr("id");
      	if(poiId.indexOf("copy-template")!=-1) {

      		Poi.removeCopyTemplate({ index: index }, function(copyPoi){

      			// Update copy poi list
      			$scope.copyPoiTemplateList = copyPoi;

		    	// Show success msg
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);

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
				$().toastmessage('showSuccessToast', dialogInfo.removeSuccess);

      		}, function(res) {

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg);						        
      			
      		});

      	}

	}

}

// Show specific poi controller
function PoiShowCtrl($rootScope, $scope, $location, $compile, Poi, Building, User) {
	var url = $location.absUrl(),
		id = url.substring(url.lastIndexOf("/") + 1, url.length) || $rootScope.selectedBuilding.id;	
	$scope.loadingPoi = true;
	Poi.get({ _id : id }, function(poi){
		
		// Assign custom fields by default
		$scope.poi = poi;

		// Construct custom fields area
		for(var key in poi.customFields){ // handle the file undefined
			var thePoi = poi.customFields[key],
				type = thePoi.type,
			 	value = thePoi.value;			
			// image type
			if(type == 3){
				if(!value)
					thePoi.displayValue = "/img/no-image.png";
				else
					thePoi.displayValue = "/poi/getFile?type=image&filePath=" + value;
			}
		}

        $scope.poiClone = angular.copy(poi); // Clone area for future rollback        
    	$scope.loadingPoi = false;

		// Get building of poi
		Building.get({ _id: poi.buildingId }, function(building){
			$scope.building = building;
		});

		// Get building of poi and user's building
		$scope.poiBuilding = { name: "Binding Building" };
		$scope.poiBuildingClone = $scope.poiBuilding;
		if($scope.poi.buildingId){
			Building.get({ _id: $scope.poi.buildingId }, function(building){
				$scope.poiBuilding = building;
				$scope.poiBuildingClone = building;
			}, function(){
				$scope.poiBuildingClone = $scope.poiBuilding;
			});
		}

		// Get user's tags for poi tag autocomplete
		User.poiTags({}, function(poiTags){
			
			var userTags = [];
			for(key in poiTags)
				userTags[key] = poiTags[key].data;

			var substringMatcher = function(strs) {
			  return function findMatches(q, cb) {
			    var matches, substringRegex;
			 
			    // an array that will be populated with substring matches
			    matches = [];
			 
			    // regex used to determine if a string contains the substring `q`
			    substrRegex = new RegExp(q, 'i');
			 
			    // iterate through the pool of strings and for any string that
			    // contains the substring `q`, add it to the `matches` array
			    $.each(strs, function(i, str) {
			      if (substrRegex.test(str)) {
			        // the typeahead jQuery plugin expects suggestions to a
			        // JavaScript object, refer to typeahead docs for more info
			        matches.push({ value: str });
			      }
			    });
			 
			    cb(matches);
			  };
			};
			
			// Setup tags
			var	poiTags = $scope.poi.tags;

			// Bootstrap tag manager library
			var tagApi = $("#poi-tag-input").tagsManager({
				prefilled: poiTags
			});

			// Twitter typehead autocomplete setup
			tagApi.typeahead({ 
				hint: true,
				highlight: true,
				minLength: 1
			},{
				name: 'tags',
				displayKey: 'value',
				source: substringMatcher(userTags)
			}).on('typeahead:selected', function (e, d) {		 
				
				// Select autocomplete dialog then push new tag	
				tagApi.tagsManager("pushTag", d.value);		 
		    
		    });

			// Event handler for check tags value change
		    $("input[name=hidden-" + tagApi.attr("name") + "]").on('change', function(v, nv){
				// Start other fields edit first
				unEditFields();			    	
		    	$(".tagsButtonSave").show();
		    	$(".tagsButtonCancel").show();
		    });

		});
	
		// Set clipboard forp copy poi id
		clipboardSetup();
		
		$scope.cfg = new CustomFieldsGenerator({}, $scope, $compile, Poi);

		// Setup tooltip
		tooltipSetup();

	});
	
	// Function for show error message
	function showErrorMsg(res){
		var errorMsg = res && res.data && res.data.msg;
		$().toastmessage('showErrorToast', errorMsg);					
	}

	// Function for show error message
	function showSuccessMsg(){
		$().toastmessage('showSuccessToast', dialogInfo.updateSuccess);			
	}

	// Function for toogle name block
	$scope.toogleNameBlock = function(mode){
		if(mode) {				
			$(".nameDisplayBlock").fadeIn();
			$(".nameEditBlock").hide();		
		} else {
			// Start other fields edit first
			unEditFields();	
			$(".nameDisplayBlock").hide();
			$(".nameEditBlock").fadeIn();					
		}
	}

	// Function for update poi name
	$scope.update = function(poiObj, successCallback, errorCallback){
		var poi = this.poi || poiObj;
		poi.$save(function(){
			$scope.toogleNameBlock(1);
			showSuccessMsg();
			if(successCallback)
				successCallback();
		}, function(res){
			showErrorMsg(res);
			if(errorCallback)
				errorCallback();			
		});
	}

	// Function for cancel update poi name
	$scope.cancelUpdate = function(){
		angular.copy($scope.poiClone, $scope.poi);
		$scope.toogleNameBlock(1);
	}

	// Function for cancel update poi tags
	$scope.tagSave = function(e){
		var poi = this.poi;
		poi.tags =	$("#poi-tag-input").tagsManager("tags");		
		$scope.update(poi, function(){
		}, function(){
			angular.copy($scope.poiClone, poi);			
		});		
	}

	// Function for cancel update poi tags
	$scope.tagCancel = function(e){
		var poi = this.poi,
			poiTags = poi.tags && poi.tags.indexOf(",")!=-1 ? poi.tags.split(",") : [],
			poiTagInput = $("#poi-tag-input");
		
		// Empty tags first
		poiTagInput.tagsManager("empty");

		// Push original tags
		for(var key in poiTags)
			poiTagInput.tagsManager("pushTag", poiTags[key]);
	    
		// Hide buttons
	    $(".tagsButtonSave").hide();
	    $(".tagsButtonCancel").hide();
	}
		
}

// Function for copy poi
function copyPoi(e, $scope, Poi, poi){
	Poi.copy( poi, function(copyPoi) {

		// Put copy list		
		$scope.copyPoiList = copyPoi;

		// Change tooltip title
  		var poiId = angular.element(e.currentTarget),
  			poiIdCopyTooltipTitle = "Copy poi";
  		poiId.tooltip("destroy");
  		poiId.tooltip({
  			title: "Copied"
  		});
		poiId.tooltip("show");
		setTimeout(function(){
			poiId.one('hide.bs.tooltip', function(e){
		  		poiId.tooltip("hide");
		  		poiId.tooltip("destroy");
		  		poiId.tooltip({
		  			title: poiIdCopyTooltipTitle
		  		});
			});	
		}, 10);

	}, function(){

	});
}

// Function for copy poi tempate
function copyPoiTemplate(e, $scope, Poi, poi){
	Poi.copyTemplate( poi, function(copyPoi) {		
		
		// Put copy template list
		$scope.copyPoiTemplateList = copyPoi;

		// Change tooltip title
  		var poiId = angular.element(e.currentTarget),
  			poiIdCopyTooltipTitle = dialogInfo.copyPoiTemplateTitle;
  		poiId.tooltip("destroy");
  		poiId.tooltip({
  			title: dialogInfo.copied
  		});
		poiId.tooltip("show");
		setTimeout(function(){
			poiId.one('hide.bs.tooltip', function(e){
		  		poiId.tooltip("hide");
		  		poiId.tooltip("destroy");
		  		poiId.tooltip({
		  			title: poiIdCopyTooltipTitle
		  		});
			});	
		}, 10);

	}, function(){

	});
}

// Function for setup poi id copy clipboard by zeroclipboard
var poiIdCopyTooltipTitle = dialogInfo.copyId;
function clipboardSetup(){
	var client = new ZeroClipboard( document.getElementById("poiId") );
	client.on( "ready", function( readyEvent ) {
	  client.on( "aftercopy", function( event ) {
	  		var poiId = $('#poiId'),
	  			poiIdCopyTooltipTitle = dialogInfo.copyId;
	  		poiId.tooltip("destroy");
	  		poiId.tooltip({
	  			title: dialogInfo.copied
	  		});
			poiId.tooltip("show");
			setTimeout(function(){
				poiId.one('hide.bs.tooltip', function(e){
			  		poiId.tooltip("hide");
			  		poiId.tooltip("destroy");
			  		poiId.tooltip({
			  			title: poiIdCopyTooltipTitle
			  		});
				});	
			}, 10)
	  });
	});		
}

// Function for setup tooltip
function tooltipSetup(){

	// Tooltip of copy poi and copy poi template
	$('.copy:not(#copy-poi-trigger-button span)').tooltip( { title: dialogInfo.copyPoiTitle } );
	$('.copy-template:not(#copy-poi-template-trigger-button span)').tooltip( { title: dialogInfo.copyPoiTemplateTitle } );


	// Tooltip of copy poi id to clipboard 
	$('#poiId').tooltip({ title: poiIdCopyTooltipTitle });	


}

// Function for stop fields edit while specific field start to edit
function unEditFields(){
	
	// Stop name field edit
	$(".nameDisplayBlock").fadeIn();
	$(".nameEditBlock").hide();

	// Stop tag field edit
	$(".tagsButtonSave").hide();
	$(".tagsButtonCancel").hide();

	// Stop custom fields edit
	$(".templateCustomField > .templateCustomFieldsDisplay").fadeIn();
	$(".templateCustomField > .templateCustomFieldsEdit").hide();		

}	

// PoiShowCtrl.$inject = ['$scope', 'Poi'];