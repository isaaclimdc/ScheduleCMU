function getCourseModel(Schema, mongoose) {
  var ClassSchema = new Schema({
    Day: String,
    Start: String, //TODO? Store these as numbers in the scraper ??
    End: String,
    Loc: String
  });

  var SectionSchema = new Schema();
  SectionSchema.add({
    Num: String,
    Instructor: String, //Can contain multiple instructors
    Mini: Number,
    Classes: [ClassSchema],
    Subsections: [SectionSchema]
  });

  var CourseSchema = new Schema({
    Num: Number,
    Name: String,
    Semester: Number,
    Description: String,
    URL: String,
    Units: String,
    Sections: [SectionSchema]
  });

  return mongoose.model('Course', CourseSchema);
}


module.exports.getCourseModel = getCourseModel;
