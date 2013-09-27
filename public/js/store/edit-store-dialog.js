var utility = Utility.getInstance();


$(document).ready(function(){

	// Add Store Form Setup
	addStoreFormControl();
	
	// Add some control while add-store-dialog show
	$("#add-store-dialog").on('shown.bs.modal', function(){
		
		// Set current selected floor on field floor
		$("#add-store-form select option[value=" + currentSelectedFloor + "]").attr("selected", "selected");
		
		// Set floorId
		$("#add-store-form input[name=floor]").val(currentSelectedFloor);
		
		
	});
	
	
	
});

// Ajax form submit for add store dialog
function addStoreSubmitForm(){	
	//var textFields = $('#add-store-form :text').fieldValue();
		
	var errorMsg = $("#add-store-dialog-error-msg"),
		nameObj = $("#add-store-form input[name=name]"),
		phoneObj = $("#add-store-form input[name=phone]"),
		memoObj = $("#add-store-form input[name=memo]"),
		linkObj = $("#add-store-form input[name=link]");	
	if(  utility.emptyValidate(nameObj, errorMsg) &&
		 utility.emptyValidate(phoneObj, errorMsg) &&
		 utility.emptyValidate(memoObj, errorMsg) &&
		 utility.emptyValidate(linkObj, errorMsg) ){
		
		console.log("dkdkdkdkkdd");
		$('#add-store-form').ajaxSubmit();
		
	}
	
    return false; 
    
};


// Form setup
function addStoreFormControl(){
	
	// Ajax from setup
	var options = {

		beforeSend : function(){ // pre-submit callback
			
			// Disable all fields
			$("#add-store-form input").attr('disabled', 'disabled');
			
			// Hide error msg
			$("#add-store-dialog-error-msg").hide();
			
			// TODO: Show loading effect
			
			return true;
		}, 
		uploadProgress : function(event, position, total, percent){ // upload progress callback
			
		},
		success : function(responseText, statusText){ // post-submit callback			
			
			// Show error msg
			if(responseText.msg){
				$("#add-store-dialog-error-msg .errorText").text(responseText.msg);				
				$("#add-store-dialog-error-msg").show();
			}			
			
			// Enable all fields
			$("#add-store-form input").removeAttr('disabled');
			
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
	$('#add-store-form').ajaxForm(options);

	
}