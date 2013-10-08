var utiliy = Utility.getInstance(),
    form_submitted = false;

function submit_form(){
	
    // Check form is submitting or not
    if(form_submitted){

        return false;

    }else{

        var email = $("#email"),
            password = $("#password"),
            errorMsgObj = $("#error-dialog");

        // Clean error msg
        errorMsgObj.css({display: "none"});
        errorMsgObj.children(".errorText").html("");

        // Check format
        if(utiliy.emailValidate(email, errorMsgObj) && utiliy.passwordValidate(password, errorMsgObj)){
            $("#submit").attr("disabled", "disabled");
            form_submitted = true;
            return true;
        }

        return false;

    }

}