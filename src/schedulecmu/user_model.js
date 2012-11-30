module.exports = function (mongoose, db) {
  var Schema = mongoose.Schema;
  var UserSchema = new Schema({
    // the _id field should store the fbid of the user
    andrew: {type: String, match: /^[A-Za-z0-9]{3,8}$/},
    auth_token: {type: String},
    auth_expiry: {type: Date},
    schedules: [ScheduleSchema]
  });

  var ScheduleSchema = new Schema({
    semester: {type: Number, min: 130, max: 999},
    name : {type: String},
    course_blocks: [BlockSchema]
  });

  var BlockSchema = new Schema({
    course_id: {type: String, match: /^[0-9]{1,2}-[0-9]{3}$/},
    section_id: {type: String},
    subsection_id: {type: String, default: null}
  });
  
  UserSchema.methods.authenticate = function (auth_token) {
    // Implement facebook authentication here!
  }
}
