module.exports = function (mongoose, db) {
    var Schema = mongoose.Schema;
    var UserSchema = new Schema({
	FBId : {type: Number},
	andrew: {type: String, match: /^[A-Za-z0-9]{3,8}$/},
	auth_token: {type: String},
	auth_expiry: {type: Date},
	schedules: [ScheduleSchema]
    });

   var ScheduleSchema = new Schema({
	semester: {type: Number, min: 130, max: 999}, //change if we support older semesters
	name : {type: String},
	course_blocks: [BlockSchema]
   });

   var BlockSchema = new Schema({
        course_num: {type: String, match: /^[0-9]{1,2}-[0-9]{3}$/},
	section_num: {type: String},
	subsection_num: {type: String, default: null}
   });
};