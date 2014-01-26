var utility = Utility.getInstance();

$(document).ready(function(){

    $("#submit").click( function(){

        var submitButton = $("#submit"),
            nameObj = $("#name"),
            emailObj = $("#email"),
            commentObj = $("#comment"),
            errorMsgObj = $(".error-msg"),
            successMsgObj = $(".success-msg");

         if (utility.emptyValidate(nameObj, errorMsgObj) &&
             utility.emptyValidate(emailObj, errorMsgObj) &&
             utility.emptyValidate(commentObj, errorMsgObj) ) {

            // Hide error msg
            errorMsgObj.hide();
            successMsgObj.hide();

            // Change button status
            submitButton.button("loading");

            // Disable all fields
            nameObj.attr("disable", "disable");
            emailObj.attr("disable", "disable");
            commentObj.attr("disable", "disable");

            var data = {
                name: nameObj.val(),
                email: emailObj.val(),
                comment: commentObj.val()
            }
            //Ajax to server
            $.ajax({
                type: "POST",
                url: "/feedback/create",
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(res){

                    // Enable and reset all input fields and textarea
                    nameObj.removeAttr("disabled").val("");
                    emailObj.removeAttr("disabled").val("");
                    commentObj.removeAttr("disabled").val("");

                    // Change button status
                    submitButton.button("reset");

                    // Show success msg
                    successMsgObj.show();

                },
                failure: function(res) {

                    // Enable all input fields and textarea
                    nameObj.removeAttr("disabled");
                    emailObj.removeAttr("disabled");
                    commentObj.removeAttr("disabled");

                    // Change button status
                    submitButton.button("reset");

                    // Show error msg
                    errorMsgObj.show(res.msg);

                }
                
            });

         }   
         
    });

});
