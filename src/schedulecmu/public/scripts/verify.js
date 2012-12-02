/* Facebook response object:
    {
        status: 'connected',
        authResponse: {
            accessToken: '...',
            expiresIn:'...',
            signedRequest:'...',
            userID:'...'
        }
    }
*/

function verify(authResponse) {
    /* URL (from the email) in the form "../verify.html#59824c" */
    var verifyCode = window.location.hash.substring(1);
    console.log("Verify: " + verifyCode);

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