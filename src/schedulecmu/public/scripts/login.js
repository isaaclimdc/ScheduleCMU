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

$(document).ready(function() {
    $("#loginForm form").submit(function(e){
        e.preventDefault();
        createNewUser();
    });
});

function loginToFB() {
    FB.login(function(response) {
        if (response.authResponse) {
            /* Connected! */
            loginToScheduleCMU(response.authResponse);
        }
        else {
            /* Cancelled */
            console.log("Facebook login cancelled");
            window.location.href = "index.html";
        }
    });
}

function loginToScheduleCMU(fbAuthResponse) {
    /* Test that we have a working auth */
    var userName;
    FB.api('/me', function(response) {
        userName = response.name;
        console.log("Logged in with Facebook as " + userName + ".");
    });

    var fbID = fbAuthResponse.userID;
    var accessToken = fbAuthResponse.accessToken;

    performAjaxRequest({
        url : "/users/" + fbID + "?auth_token=" + accessToken,
        success : function(result, status) {
            console.log("Succesfully logged in!", result);

            /* Unhide schedules page */
            $('#content').css("display", "block");

            /* User logged in to ScheduleCMU! Start processing schedules */
            var user = result;
            fetchUserSchedule(user);
        },
        statusCode: {
            200: function() {  },
            404: function() {
                console.log("User not found");

                if (window.isMobile === false)
                    window.location.href = "register.html";
                else
                    window.location.href = "../mobile/register.html";
            }
        }
    });
}

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
            performAjaxRequest({
                type : "POST",
                url : "/users/" + fbID,
                data : {
                    "data" : {
                        "andrew" : andrewID
                    },
                    "auth_token" : accessToken,
                    "_method" : "PUT"
                },
                success : function(result, status) {
                    console.log("New user created!", result);

                    /* Show them a "sent email" message */
                    $("#loginForm #submitBtn").remove();
                    $('#loginForm form').append($("<p>").html("We've sent you a verification email!"));
                }
            });
        }
        else {
            console.log("You are not logged in to Facebook");
        }
    });
}
