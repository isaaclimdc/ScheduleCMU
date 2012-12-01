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

function loginToScheduleCMU(fbAuthResponse) {
    /* Test that we have a working auth */
    FB.api('/me', function(response) {
        console.log("Logged in with Facebook as " + response.name + ".");
    });

    var fbID = fbAuthResponse.userID;
    var accessToken = fbAuthResponse.accessToken;

    $.ajax({
        url : "http://schedulecmu.aws.af.cm/api/users/" + fbID + "?auth_token=" + accessToken,
        success : function(result, status) {
            console.log(result);
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
                    window.location.href = "register.html#" + fbID;
                }
                else {
                    window.location.href = "../mobile/register.html#" + fbID;
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
    /* Extract FB ID from the url hash */
    var fbID = window.location.hash.substring(1);
    console.log(fbID);

    var andrewID = $("#andrewBox").val();

    $.ajax({
        type : "POST",
        url : "http://schedulecmu.aws.af.cm/api/users/" + fbID + andrewID,
        success : function(result, status) {
            console.log(result);
        },
        error : function(xhr, status, error) {
            console.log(error);
        },
        statusCode: {
            200: function() {  },
            404: function() {
                console.log("User not found");
            }
        }
    });
}
