$(document).ready(function(){
	
//	$("#mapzip-file").on('change', function(){
//		
//		ajaxSubmitForm();
//		
//	});
	
});

function ajaxSubmitForm(){
	document.getElementById('mapzip-form').target = 'mapzip-form-iframe'; //'my_iframe' is the name of the iframe
	document.getElementById('mapzip-form').submit();
}
