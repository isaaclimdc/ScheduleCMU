// Additional JS functions here
window.fbAsyncInit = function() {
    FB.init({
        appId      : '102585986572914', // App ID
        channelUrl : 'channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
    });

};

// Load the SDK Asynchronously
(function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "http://connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));

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

function login() {
    FB.login(function(response) {
        if (response.authResponse) {
            /* Connected! */
            loginToScheduleCMU(response.authResponse);
        }
        else {
            /* Cancelled */
            console.log("Facebook login cancelled");
        }
    });
}

window.baseURL = "http://schedulecmu.aws.af.cm/api";

function loginToScheduleCMU(fbAuthResponse) {
    /* Test that we have a working auth */
    var userName;
    FB.api('/me', function(response) {
        userName = response.name;
        console.log("Logged in with Facebook as " + userName + ".");
    });

    var fbID = fbAuthResponse.userID;
    var accessToken = fbAuthResponse.accessToken;

    $.ajax({
        url : window.baseURL + "/users/" + fbID + "?auth_token=" + accessToken,
        success : function(result, status) {
            console.log("Succesful log in!", result);

            window.location.href = "schedule.html";
        },
        error : function(xhr, status, error) {
            console.log(error);
        },
        statusCode: {
            200: function() {  },
            404: function() {
                console.log("User not found");
                var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

                if (isMobile === false) {
                    window.location.href = "register.html";
                }
                else {
                    window.location.href = "../mobile/register.html";
                }
            }
        }
    });
}

$(document).ready(function() {
    $("#loginForm form").submit(function(e){
        e.preventDefault();
        createNewUser();
    });
});

function createNewUser() {
    FB.getLoginStatus(function(response) {
        var andrewID = $("#andrewBox").val();

        if (response.status === 'connected') {
            var accessToken = response.authResponse.accessToken;
            var fbID = response.authResponse.userID;
            console.log(fbID);

            /* Create a new user on the server. Automatically sends
             * a verification email to their andrew email
             */
            $.ajax({
                type : "POST",
                url : window.baseURL + "/users/" + fbID,
                data : {
                    "andrew" : andrewID,
                    "auth_token" : accessToken
                },
                success : function(result, status) {
                    console.log("New user created!", result);

                    /* Show them a "sent email" message */
                    $("#loginForm").append($("<p>").html("We've sent you a verification email!"));
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
        else {
            console.log("You are not logged in to Facebook");
        }
    });
}

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
        url : window.baseURL + "/users/" + fbID,
        data : {
            "_id" : fbID,
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