request = require("request");

/* SHH IT'S A SECRET */
var app_access = "102585986572914|a_j0-_3SoiGwgLvcemx0gYE3jQo"

module.exports = function (mongoose, db) {
    var Schema = mongoose.Schema;

    var BlockSchema = new Schema({
        _id: {type: String},
        section: {type: Number},
        subsection: {type: Number, default: null}
    });

    var ScheduleSchema = new Schema({
        semester: {type: Number, min: 130, max: 999},
        name : {type: String},
        course_blocks: [BlockSchema]
    });

    var UserSchema = new Schema({

        /* the _id field should store the Facebook id of the user */
        _id: {type: String},

        /* this stores the andrew id of the user */
        andrew: {type: String, match: /^[A-Za-z0-9]{3,8}$/},

        /* these are obtained from Facebook */
        auth_token: {type: String, default: null},
        auth_expiry: {type: Number, default: null},
        verify_code: {type: String, default: null},

        /* reflects the user's activity */
        karma : {type: Number, default: 10},

        /* stores the schedules that the user makes */
        schedules: [ScheduleSchema]
    });


    UserSchema.methods.authenticate = function (auth_token, cb) {

        /* makes the user accessible in future callbacks */
        var curUser = this;

        if (auth_token == null || auth_token == '') {
            cb('invalid');
            return;
        }

        var currentTime = new Date().getTime() / 1000;
        if (this.auth_token == auth_token &&
            currentTime < this.auth_expiry) {
            if (this.verify_code == null)
                cb("valid");
            else
                cb("verify");
            return;
        }

        /* if not a match, we need to verify with Facebook... */
        var debug_url = "https://graph.facebook.com/debug_token?input_token=" +
                         auth_token + "&access_token=" + app_access;
        request.get({url:debug_url, json:true}, function (err, res, body) {
            if (err) {
                console.log (err);
                /* this is really bad - we don't know if the user is valid */
                cb("invalid");
                return;
            }

            if (body.data == undefined) {
                cb("invalid");
                return;
            }

            if (curUser._id == body.data.user_id && body.data.is_valid) {
                curUser.auth_token = auth_token;
                curUser.auth_expiry = body.data.expires_at;
                curUser.save(function (err) {
                    console.log(err);
                });
                if (curUser.verify_code == null)
                    cb("valid");
                else
                    cb("verify");
            } else {
                console.log("Invalid");
                cb("invalid");
            }
      });
    }

    UserSchema.methods.sendVerifyEmail = function(){
        var nodemailer = require("nodemailer");

        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: "schedulecmu@gmail.com",
                pass: "$chedule"
            }
        });

        var mailOptions = {
            /* sender address */
            from: "ScheduleCMU.org <admin@schedulecmu.org>",

            /* list of receivers */
            to: this.andrew + "@andrew.cmu.edu",

            /* subject line */
            subject: "Verify your account at ScheduleCMU",

            /* plaintext version of the message body */
            text: "Hi " + this.andrew + ",\nPlease go to the following url to verify" +
            "your email address:\nhttp://www.schedulecmu.org/verify.html#" + this.verify_code +
            "\nThis is an auto-generated email. Please do not reply to this mail.",

            /* html version of the message body */
            html: "Hi " + this.andrew + ",<p>Please click <span>" +
            "<a href='http://www.schedulecmu.org/verify.html#" + this.verify_code +
            "'>here</a></span> to verify your account.</p><p>-- ScheduleCMU Admin</p>" +
            "<p style='font-size: 10px;'>This is an auto-generated email." +
            " Please do not reply to this mail.</p>"
        }

        /* send mail with defined transport object */
        smtpTransport.sendMail(mailOptions, function(error, response){
            if (error) {
                console.log(error);
            }
            else {
                console.log("Message sent: " + response.message);
            }
        });
    }

    return db.model('User', UserSchema);
}
