$(document).ready(function(){

	// Setup update form
	updateFormControl();

	// Setup mapzip form
	mapzipFormControl();

	// Setup image form
	imageFormControl();

});


// -----------------------------------------------------------------------------------------------
// Update form control
function updateFormControl(){

	var saveButton = $("#update-form-save");

	// Check name field
	var nameInput = $("#update-form-name"),
		oldName = nameInput.val();

	// Check desc field
	var descInput = $("#update-form-desc"),
		oldDesc = descInput.val();

	// Check function
	function changeValueCheck(oldValue, allowEmpty){
		var newValue = $.trim($(this).val());
		if(oldValue != newValue){
			if(!allowEmpty && !newValue)
				saveButton.attr("disabled", "disabled");
			else
				saveButton.removeAttr("disabled");
		}else{
			saveButton.attr("disabled", "disabled");
		}
	}

	nameInput.on("keyup", function(){
//		if(!$.trim($(this).val())){
//			saveButton.attr("disabled", "disabled");
//			return;
//		}
		changeValueCheck.call(this, oldName, false);
	});
	descInput.on("keyup", function(){
		changeValueCheck.call(this, oldDesc, true);
	});

	// Update form
	saveButton.on("click", function(){

		// Disable input fields
		$("#update-form input").attr("disabled", "disabled");
		$("#update-form textarea").attr("disabled", "disabled");

		// Disable button
		saveButton.attr("disabled", "disabled");

		var data = {
			id: $("#update-form-id").val(),
			name: nameInput.val(),
			desc: descInput.val()
		};
        $.ajax({
            type: "POST",
            url: "/user/building/update",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function(data, status){

            	console.log("kldjlsjflsjflsdkfl")
        		// Enable input fields
        		$("#update-form input").removeAttr("disabled");
        		$("#update-form textarea").removeAttr("disabled");

        		// Enable button
        		saveButton.removeAttr("disabled");
            }
        });

	});


}


// Mapzip form control
function mapzipFormControl() {

	// Ajax from setup
	var options = {

		target : '#mapzip-updateTime', // target element(s) to be updated with server response

		beforeSend : function(){ // pre-submit callback
			$("#mapzip-form input").attr('disabled');
			$("#mapzip-upload-error-dialog").hide();
			return true;
		},
		uploadProgress : function(event, position, total, percent){ // upload progress callback

		},
		success : function(responseText, statusText){ // post-submit callback
			// Show error msg
			if(responseText.msg){
				$("#mapzip-upload-error-dialog .errorText").text(responseText.msg);
				$("#mapzip-upload-error-dialog").show();
			}

			// Hide button
			$("#edit-building-button-save-mapzip").hide();
			return true;
		},

		// other available options:
		clearForm : true, // clear all form fields after successful submit
		// url: url // override for form's 'action' attribute
		// type: type // 'get' or 'post', override for form's 'method' attribute
		// dataType: null // 'xml', 'script', or 'json' (expected server
		// response type)
		// resetForm: true // reset the form after successful submit
		// $.ajax options can be used here too, for example:
		// timeout: 3000
		// iframe: true // if use iframe, it will not support progress bar

	};
	$('#mapzip-form').ajaxForm(options);

	// Detect file change
	$("#mapzip-file").on('change', function() {
		$("#edit-building-button-save-mapzip").show();
	});

}

// Image form control
function imageFormControl(){

	// Ajax from setup
	var options = {

		beforeSend : function(){ // pre-submit callback
			$("#image-form input").attr('disabled');
			$("#image-upload-error-dialo").hide();
			return true;
		},
		uploadProgress : function(event, position, total, percent){ // upload progress callback

		},
		success : function(responseText, statusText){ // post-submit callback
			// Show error msg
			if(responseText.msg){
				$("#image-upload-error-dialog .errorText").text(responseText.msg);
				$("#image-upload-error-dialog").show();
			}else{

				// Set image link
				$("#edit-building-icon").attr("src", responseText);
			}

			// Hide button
			$("#edit-building-button-save-image").hide();


		},

		// other available options:
		clearForm : true, // clear all form fields after successful submit
		// url: url // override for form's 'action' attribute
		// type: type // 'get' or 'post', override for form's 'method' attribute
		// dataType: null // 'xml', 'script', or 'json' (expected server
		// response type)
		// resetForm: true // reset the form after successful submit
		// $.ajax options can be used here too, for example:
		// timeout: 3000
		// iframe: true // if use iframe, it will not support progress bar
	};
	$('#image-form').ajaxForm(options);

	// Detect file change
	$("#image-file").on('change', function() {
		$("#edit-building-button-save-image").show();
	});

}
