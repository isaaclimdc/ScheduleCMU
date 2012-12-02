$(document).ready(function() {
    verify();
});

function verify() {
    /* URL (from the email) in the form "../verify.html#59824c_1024948488" */
    var hashArgs = window.location.hash.substring(1);
    var verifyStartIdx = hashArgs.indexOf("_");
    var verifyCode = hashArgs.substring(0, verifyStartIdx);
    var fbID = hashArgs.substring(verifyStartIdx+1);
    console.log("Verify: " + verifyCode);
    console.log("FBID: " + fbID);

    $.ajax({
        type : "POST",
        url : "http://schedulecmu.aws.af.cm/api/users/" + fbID + "/verify/",
        data : {
            "verify_code" : verifyCode
        },
        success : function(result, status) {
            console.log(result);
        },
        error : function(xhr, status, error) {
            console.log(error);
        },
        statusCode: {
            200: function() {  },
            404: function() { console.log("Page not found"); }
        }
    });
}