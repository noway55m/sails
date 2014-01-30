$(document).ready(function(){

	/* Toggle edit button and exchange display adn edit mode */
	$(document).on('mouseover', ".display-block", function(){

		// Toggle edit button
		 $(this).find(".edit-button").fadeIn();
		 $(this).find(".remove-button").fadeIn();

	}).on('mouseleave', ".display-block", function(){

		// Toggle edit button
		 $(this).find(".edit-button").fadeOut();
		 $(this).find(".remove-button").fadeOut();

		
	}).on('click', ".edit-button", function(){

		// Toggle edit block
		$(this).parent().hide();
		// $(this).parent().parent().find(".edit-block").first().fadeIn();
		$(this).parent().nextAll('.row.edit-block:first').fadeIn();

	}).on('click', ".close-button", function(){

		// Toggle display block
		$(this).parent().hide();
		// $(this).parent().parent().find(".display-block").first().fadeIn();
		$(this).parent().prevAll('.row.display-block:first').fadeIn();

	});

	//------------------------------------------------

	// Detect change of ad image, then show the upload button
	$(document).on('change', ".upload-file", function() {
		$(this).parent().next().show();
	});
	
	// Notification Message Dialog
	$().toastmessage({
		sticky : false,
		position: 'top-center'
	});	
	
});