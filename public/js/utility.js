/**
 *  Utility class for handle all common feature
 *
 **/
function Utility(){
    if ( arguments.callee.instance )
        return arguments.callee.instance;
    arguments.callee.instance = this;
}

Utility.getInstance = function() {
    var utility = new Utility();
    return utility;
};

Utility.prototype.fieldValidate = function(value, fieldObj, errorMsgObj, regExpressFormat){

    var format = regExpressFormat,
        fieldName = $("label[for=" + fieldObj.attr("name") + "]").text(),
        result = false;
    
    if(!fieldName)
    	fieldName = fieldObj.attr("name");
    	
    // Check format
    if(!value){
        errorMsgObj.children(".errorText").html("Field '" + fieldName + "' is empty");
        result = false;
    }else if(!format.test(value)){
        errorMsgObj.children(".errorText").html("Format of field '" + fieldName + "' is incorrect");
        result = false;
    }else{
        result = true;
    }

    // Show error info
    if(!result){
        errorMsgObj.css({display: ""});
        fieldObj.focus();
        fieldObj.select();
    }

    return result;

};

// Function for validate email input fields and focus, select then show error message if format error occur
Utility.prototype.emailValidate = function(fieldObj, errorMsgObj){
    var format = /^([_a-z0-9-]+)(\.[_a-z0-9-]+)*@([a-z0-9-]+)(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/, // email regex
        value = $.trim(fieldObj.val()).toLowerCase();
    return utility.fieldValidate(value, fieldObj, errorMsgObj, format);
};

// Function for validate password input fields and focus, select then show error message if format error occur
Utility.prototype.passwordValidate = function(fieldObj, errorMsgObj){
    var format = /|S*/, // not defined yet, use normal string now
        value = $.trim(fieldObj.val());
    return utility.fieldValidate(value, fieldObj, errorMsgObj, format);
};

//Function for validate password input fields and focus, select then show error message if format error occur
Utility.prototype.emptyValidate = function(fieldObj, errorMsgObj){
    var format = /|S*/, // not defined yet, use normal string now
        value = $.trim(fieldObj.val());
    return utility.fieldValidate(value, fieldObj, errorMsgObj, format);
};
