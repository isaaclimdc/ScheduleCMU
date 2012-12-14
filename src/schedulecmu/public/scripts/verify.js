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
    console.log("Verify Code: " + verifyCode);

    var fbID = authResponse.userID;

    $.ajax({
        type : "POST",
        url : "http://www.schedulecmu.org/api/users/" + fbID + "/verify/",
        data : {
            "verify_code" : verifyCode,
            "auth_token" : authResponse.accessToken
        },
        success : function(result, status) {
            console.log(result);

            var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

            /* Successfully verified, now login */
            if (isMobile === false)
                window.location.href = "desktop/schedule.html";
            else
                window.location.href = "mobile/index.html";
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