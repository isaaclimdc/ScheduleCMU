// Additional JS functions here
window.fbAsyncInit = function() {
    FB.init({
        appId      : '102585986572914', // App ID
        channelUrl : 'channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true  // parse XFBML
    });

    // FB.getLoginStatus(function(response) {
    //     if (response.status === 'connected') {
    //         /* Connected! */
    //         loginToScheduleCMU(response.authResponse);
    //     }
    //     else if (response.status === 'not_authorized') {
    //         /* Not authorized */
    //         console.log("Authorizing...");
    //         login();
    //     }
    //     else {
    //         /* Not logged in */
    //         console.log("Authorizing...");
    //         login();
    //     }
    // });
};

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

    performAjaxRequest({
        url : "/users/" + fbid + "?auth_token=" + accessToken,
        success : function(result, status) {
            console.log(result);
        }
    });
}

// Load the SDK Asynchronously
(function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "http://connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));


/** Start copy (from schedule.js) **/
/* Base URL for the API */
window.baseURL = "http://schedulecmu.aws.af.cm/api";

/* A convenient wrapper for $.ajax that automatically starts and stops
 * the spinner (spin.js), and does error checking. Requires an argument
 * opts: { url: string , success: fn, error (optional) : fn }
 */
function performAjaxRequest(opts) {
    if (window.isMobile === false)
        startSpinner();

    $.ajax({
        url: (opts.customurl !== undefined) ? opts.customurl : window.baseURL + opts.url,
        success: function(result, status) {
            /* Always log the request status */
            console.log(status);

            /* Parse it if it's not a custom request */
            if (opts.customurl === undefined) {
                if (typeof(result) !== "object")
                    result = $.parseJSON(result);
            }

            /* Perform user callback */
            opts.success(result, status);

            if (window.isMobile === false)
                 stopSpinner();
        },
        error: function(xhr, status, error) {
            if (opts.error !== undefined)
                opts.error(xhr, status, error);
            else
                console.log("Error: " + status + " with HTTP error: " + error);
            
            if (window.isMobile === false)
                 stopSpinner();
        },
        statusCode: {
            200: function() {  },
            404: function() { console.log("PAGE NOT FOUND!"); }
        }
    });
}
/** End copy **/