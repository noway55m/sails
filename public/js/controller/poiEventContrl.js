var utility = Utility.getInstance(),
	calendar = null;

// Poi Event Controller
 app.controller('PoiEventCtrl', ['$scope', 'Building', 'Poi', 'PoiEvent', '$compile', '$rootScope', 
 	function($scope, Building, Poi, PoiEvent, $compile, $rootScope){

	// Setup calendar ui component
	setupCalenderUI($scope, $compile);
	
	// Get poi id	
	var params = location.search,
		paramPoiId = "poiId=" ,
 		poiId = params.substring(params.indexOf("poiId=") + paramPoiId.length);

    // List all buildings
	$scope.loadingPoi = true;
	$scope.loadingPoiEvent = true;
	$scope.loadingBuilding = true;

	// Get poi
 	Poi.get({ _id: poiId }, function(poiObj){

 		$scope.poi = poiObj;
 		$scope.loadingPoi = false;

		// Get building
		Building.get({ _id: $scope.poi.buildingId }, function(buildingObj){

			$scope.building = buildingObj;
	 		$scope.loadingBuilding = false;

		}, function(res) {

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg); 

		});

		// Get poi event list by start time and end time
		var type = calendar.options.view,
			cstart = calendar.options.position.start,
			yearMonth =  cstart.getFullYear() + "-" + (cstart.getMonth() + 1),
			startDate = null,
			endDate = null;
		if(type=="day") {
			startDate = yearMonth + "-" + cstart.getDate();
			endDate = startDate; 
		} else if(type=="month"){
			startDate = yearMonth + "-1";
			var numDays = new Date(cstart.getFullYear(), (cstart.getMonth() + 1), 0).getDate()
			endDate = yearMonth + "-" + numDays;
		}
		PoiEvent.list({ 

			poiId: poiId, 
			start: startDate, 
			end: endDate

		}, function(events) {

			var startDate,
				start,
				endDate, 
				end, 
				i, 
				event;
			for(i=0; i<events.length; i++){
				try{
					startDate = new Date(events[i].start),
					endDate = new Date(events[i].end),
					start = startDate.getTime();
					end = endDate.getTime();
				} catch(e) {
					console.log(e);
				}

				event = {
					id: events[i]._id,
					class: "event-important",
					title: events[i].title,
					desc: events[i].desc,
					start: start,
					startDate: startDate,
					end: end ,
					endDate: endDate 					
				}				
				calendar.options.events_source.push(event);
			}

			// Update view by calendar method
			calendar.view();

		}, function(res) {

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg); 

		});

 	}, function(res) {

		// Show error msg
		var errorMsg = res && res.data && res.data.msg;
		$().toastmessage('showErrorToast', errorMsg); 

 	});	


	// Function for add poi event
	$scope.addPoiEvent = function(e) {

		var addButton = angular.element(e.currentTarget),
			errorMsgObj = addButton.parent().prev().find('error-msg'),
			form = addButton.parent().parent(),
			title = form.find("input[name='title']"),
			desc = form.find("textarea[name='desc']"),
			startTimeHourEle = form.find("select[name='startTimeHour']"),
			startTimeMinEle = form.find("select[name='startTimeMin']"),
			endTimeHourEle = form.find("select[name='endTimeHour']"),
			endTimeHMinEle = form.find("select[name='endTimeMin']"),
			startTimeHour = startTimeHourEle.find("option:selected"),
			startTimeMin = startTimeMinEle.find("option:selected"),
			endTimeHour = endTimeHourEle.find("option:selected"),
			endTimeHMin = endTimeHMinEle.find("option:selected");

		if(utility.emptyValidate(title, errorMsgObj)) {

			// Disable all fields and buttons
			title.attr("disabled", "disabled");
			desc.attr("disabled", "disabled");
			startTimeHour.attr("disabled", "disabled");
			startTimeMin.attr("disabled", "disabled");
			endTimeHour.attr("disabled", "disabled");
			endTimeHMin.attr("disabled", "disabled");								
			addButton.button('loading');

			// Hide error msg block
			errorMsgObj.hide();

			// Construct new poi event obj
			var theDate = calendar.getTitle('date'),
				startTime = new Date(theDate + " " + startTimeHour.val()	+ ":" + startTimeMin.val()).getTime(),
				endTime = new Date(theDate + " " + endTimeHour.val()	+ ":" + endTimeHMin.val()).getTime();
				
			var poiEventObj = {
				title: title.val(),
				desc: desc.val(),
				poiId: $scope.poi._id,
				start: startTime,
				end: endTime
			};

			// Save to server
			PoiEvent.create(poiEventObj, function(poiEvent) {

				// Enable all fields and button
				title.removeAttr("disabled");
				desc.removeAttr("disabled");
				startTimeHourEle.removeAttr("disabled");
				startTimeMinEle.removeAttr("disabled");
				endTimeHourEle.removeAttr("disabled");
				endTimeHMinEle.removeAttr("disabled");								
				addButton.button("reset");

				// Push event to events_source
				var startDate,
					endDate,
					start,
					end;
				try{
					startDate = new Date(poiEvent.start),
					endDate = new Date(poiEvent.end),
					start = startDate.getTime();
					end = endDate.getTime();
				} catch(e) {
					console.log(e);
				}

				var pe = {
					id: poiEvent._id,
					class: "event-important",
					title: poiEvent.title,
					desc: poiEvent.desc,
					start: start,
					startDate: startDate,
					end: end ,
					endDate: endDate 					
				}				
				calendar.options.events_source.push(pe);		

				// Update event source view
				calendar.view();

				// Close dialog
				$("#add-poi-event-dialog").modal("hide");

				// Show success msg
				$().toastmessage('showSuccessToast', "success"); 

			}, function(res) {

				// Enable all fields and button
				title.removeAttr("disabled");
				desc.removeAttr("disabled");
				startTimeHourEle.removeAttr("disabled");
				startTimeMinEle.removeAttr("disabled");
				endTimeHourEle.removeAttr("disabled");
				endTimeHMinEle.removeAttr("disabled");								
				addButton.button("reset");

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg); 

			})

		}

	}

	// Function for update poi event
	$scope.updatePoiEvent = function(e){
		
		var poiEvent = this.selectedEvent,
			addButton = angular.element(e.currentTarget),
			errorMsgObj = addButton.parent().prev().find('error-msg'),
			form = addButton.parent().parent(),
			title = form.find("input[name='title']"),
			desc = form.find("textarea[name='desc']"),
			selectFields = form.find("select[name='endTimeMin']");

		if(utility.emptyValidate(title, errorMsgObj)) {

			// Disable all fields and buttons
			title.attr("disabled", "disabled");
			desc.attr("disabled", "disabled");
			selectFields.attr("disabled", "disabled");								
			addButton.button('loading');

			// Hide error msg block
			errorMsgObj.hide();

			var theDate = calendar.getTitle('date'),
				startTime = new Date(theDate + " " + poiEvent.startTimeHour	+ ":" + poiEvent.startTimeMin),
				endTime = new Date(theDate + " " + poiEvent.startTimeHour	+ ":" + poiEvent.endTimeMin);
				
			var poiEventObj = JSON.parse(JSON.stringify(poiEvent));
			poiEventObj.start = startTime;
			poiEventObj.end = endTime;
			poiEventObj._id = poiEvent.id;
			console.log(poiEventObj);
			PoiEvent.updated(poiEventObj, function(poiEvent) {

				console.log(poiEvent);

				// Enable all fields and button
				title.removeAttr("disabled");
				desc.removeAttr("disabled");
				selectFields.removeAttr("disabled");							
				addButton.button("reset");

				// Update event in events_source
				var startDate,
					endDate,
					start,
					end;
				try{
					startDate = new Date(poiEvent.start),
					endDate = new Date(poiEvent.end),
					start = startDate.getTime();
					end = endDate.getTime();
				} catch(e) {
					console.log(e);
				}

				var events_source = calendar.options.events_source;
				for(var i=0; i<events_source; i++) {
					var tev = events_source[i];
					if(tev.id == poiEvent._id) {
						tev.title = poiEvent.title;
						tev.desc = poiEvent.desc;
						tev.start = startDate.getTime(),
						tev.startDate = startDate.getTime(),						
						tev.end = endDate.getTime(),
						tev.endDate = endDate.getTime()					
					}
				}

				// Update selected model start and end
				poiEvent.start = startDate.getTime();
				poiEvent.end = endDate.getTime();

				// Update view
				calendar.view();

				// Close dialog
				$("#update-poi-event-dialog").modal("hide");

				// Show success msg
				$().toastmessage('showSuccessToast', "success"); 

			}, function(res) {

				// Enable all fields and button
				title.removeAttr("disabled");
				desc.removeAttr("disabled");
				selectFields.removeAttr("disabled");							
				addButton.button("reset");

				// Show error msg
				var errorMsg = res && res.data && res.data.msg;
				$().toastmessage('showErrorToast', errorMsg); 

			})
			

		}

	}


	// Function for delete poi event
	$scope.deletePoiEvent = function(){		
		
		var deleteId = this.selectedDeleteEvent.id;
		PoiEvent.delete({ _id: deleteId  }, function(){

			// Update event list
			var event_source = calendar.options.events_source, i;
			for(i=0; i<event_source.length; i++) {
				if(event_source[i].id == deleteId)
					event_source.splice(i, 1);		
			}

			// Update calendar view
			calendar.view();			

			// Show success msg
			$().toastmessage('showSuccessToast', "success"); 
			$("#delete-poi-event-dialog").modal('hide');

		}, function(res){

			// Show error msg
			var errorMsg = res && res.data && res.data.msg;
			$().toastmessage('showErrorToast', errorMsg); 

		});	
	}

 }]);


// Function for setup calendar ui
function setupCalenderUI($scope, $compile) {

	var options = {
		$scope: $scope,
		$compile: $compile,		
		events_source: [],
		view: 'month',
		tmpl_path: '/tmpls/',
		tmpl_cache: false,
		day: 'now',
		modal : "#update-poi-event-dialog",
		deleteModal: "#delete-poi-event-dialog",
		modal_type : "template", 
		modal_title : function (e) { return e.title },		
		onAfterEventsLoad: function(events) {
			if(!events) {
				return;
			}
			var list = $('#eventlist');
			list.html('');

			$.each(events, function(key, val) {
				$(document.createElement('li'))
					.html('<a href="' + val.url + '">' + val.title + '</a>')
					.appendTo(list);
			});
		},
		onAfterViewLoad: function(view) {
			$('#calendar-title').text(this.getTitle());
			$('.btn-group button').removeClass('active');
			$('button[data-calendar-view="' + view + '"]').addClass('active');
		},
		classes: {
			months: {
				general: 'label'
			}
		}
	};

	calendar = $('#calendar').calendar(options, $scope, $compile);

	$('.btn-group button[data-calendar-nav]').each(function() {
		var $this = $(this);
		$this.click(function() {
			calendar.navigate($this.data('calendar-nav'));
		});
	});

	$('.btn-group button[data-calendar-view]').each(function() {
		var $this = $(this);
		$this.click(function() {
			// Show add button while click specific day
			if(this.innerText.indexOf('Day') != -1){
				$("#addPoiEventButton").fadeIn();
			} else {
				$("#addPoiEventButton").hide();
			}
			calendar.view($this.data('calendar-view'));
		});
	});

	$('#first_day').change(function(){
		var value = $(this).val();
		value = value.length ? parseInt(value) : null;
		calendar.setOptions({first_day: value});
		calendar.view();
	});

	$('#language').change(function(){
		calendar.setLanguage($(this).val());
		calendar.view();
	});

	$('#events-in-modal').change(function(){
		var val = $(this).is(':checked') ? $(this).val() : null;
		calendar.setOptions({modal: val});
	});	

	return calendar;

}