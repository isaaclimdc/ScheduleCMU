function validateAndrewEmail(email) {
    if (email.indexOf("@andrew.cmu.edu") === -1)
        return false;

    var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return reg.test(email);
}

function sendFeedback() {
    var andrewMail = $('#andrewMailBox').val();
    console.log(andrewMail);

    if (validateAndrewEmail(andrewMail) === true) {
        // if both validate we attempt to send the e-mail
        // first we hide the submit btn so the user doesnt click twice
        $("#submit").replaceWith("<em>Sending...</em>");
        
        $.ajax({
            type: 'POST',
            url: '../scripts/sendmessage.php',
            data: $("#feedbackForm").serialize(),
            success: function(data) {
                console.log(data);
                if (data === "true") {
                    console.log("Success!");
                }
            },
            error: function(error) {
                console.log("Error: ", error);
            }
        });
    }
    else {
        alert("Please type in a valid andrew email!");
    }
}