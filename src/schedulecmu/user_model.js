request = require("request");

// SHH IT'S A SECRET
var app_access = "102585986572914|a_j0-_3SoiGwgLvcemx0gYE3jQo"

module.exports = function (mongoose, db) {
  var Schema = mongoose.Schema;
  var UserSchema = new Schema({
    // the _id field should store the fbid of the user
    _id: {type: String},
    andrew: {type: String, match: /^[A-Za-z0-9]{3,8}$/},
    auth_token: {type: String, default: null},
    auth_expiry: {type: Number, default: null},
    verify_code: {type: String, default: null},
    schedules: [ScheduleSchema]
  });

  var ScheduleSchema = new Schema({
    semester: {type: Number, min: 130, max: 999},
    name : {type: String},
    course_blocks: [BlockSchema]
  });

  var BlockSchema = new Schema({
    course_id: {type: String},
    section_id: {type: String},
    subsection_id: {type: String, default: null}
  });

  UserSchema.methods.authenticate = function (auth_token, cb) {
    // Makes the user accessible in future callbacks
    var curUser = this;

    var currentTime = new Date().getTime() / 1000;
    if (this.auth_token == auth_token && currentTime < this.auth_expiry) {
      if (this.verify_code == null)
        cb("valid");
      else
        cb("verify");
      return;
    }

    // If not a match, we need to verify with facebook...
    var debug_url = "https://graph.facebook.com/debug_token?input_token=" +
                    auth_token + "&access_token=" + app_access;
    request.get({url:debug_url, json:true}, function (err, res, body) {
      if (err) {
        console.log (err);
        // This is really bad - we don't know if the user is valid
        cb("invalid");
        return;
      }

      if (body.data == undefined) {
        cb("invalid");
        return;
      }

      console.log(body);
      console.log(this);

      if (curUser._id == body.data.user_id && body.data.is_valid) {
        curUser.auth_token = auth_token;
        curUser.auth_expiry = body.data.expires_at;
        curUser.save(function (err) {
          console.log(err);
          // Not the end of the world
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

    // create reusable transport method (opens pool of SMTP connections)
    var smtpTransport = nodemailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
        user: "schedulecmu@gmail.com",
        pass: "$chedule"
      }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: "ScheduleCMU.org <admin@schedulecmu.org>", // sender address
      to: this.andrew + "@andrew.cmu.edu", // list of receivers
      subject: "Please verify your email address", // Subject line
      text: "Go to the following url to verify your email address \n " +
            "http://schedulecmu.aws.af.cm/verified.html#" +
            this.verify_code + "_" + this._id +
            "\n This is an auto-generated email. " +
            "Please do not reply to this mail.",
      html: "<div>Click on the link below to verify your email " +
            "address</div>" +
            "<a href='http://schedulecmu.aws.af.cm/verified.html#" +
            this.verify_code + "_" + this._id + "'>VERIFY</a>" +
            "<div> This is an auto-generated email. Please do not reply " +
            "to this mail. </div>"
    }

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
        console.log(error);
      }else{
        console.log("Message sent: " + response.message);
      }
	  });
  }

  return db.model('User', UserSchema);

}
