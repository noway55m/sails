var utiliy = Utility.getInstance(),
    form_submitted = false;

function submit_form(){
	
    // Check form is submitting or not
    if(form_submitted){

        return false;

    }else{

        var email = $("#email"),
            password = $("#password"),
            confirmPassword = $("#confirm-password"),
            acceptTerm = $("#acceptTerm"),
            errorMsgObj = $("#error-dialog");

        // Clean error msg
        errorMsgObj.css({display: "none"});
        errorMsgObj.children(".errorText").html("");

        // Check format
        if(utiliy.emailValidate(email, errorMsgObj) &&
            utiliy.passwordValidate(password, errorMsgObj) &&
            utiliy.newPasswordValidate(password, confirmPassword, errorMsgObj)){

            if(acceptTerm.prop('checked')){
                $("#submit").attr("disabled", "disabled");
                form_submitted = true;
                return true;                
            } else {
               errorMsgObj.css({display: ""}); 
               errorMsgObj.children(".errorText").html("You have not accept the term yet") ;    
            }
        }

        return false;

    }

}