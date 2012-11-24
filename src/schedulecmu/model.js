function getCourseModel(Schema, mongoose) {
  var ClassSchema = new Schema({
    Day: String,
    Start: String, //TODO? Store these as numbers in the scraper ??
    End: String,
    Loc: String
  });

  var EventSchema = new Schema({
    Num: Number,
    Type: Number, //Since we have a drop down list of 4 types of events                                     
    Title: String,
    Loc: String
    Day: String, //Whether or not we need this depends on the format of recurring events
    Date: String,
    Start: String, //TODO? If we use dropdowns, this could be a number                                       
    End: String, //TODO? If we use dropdowns, this could be number                                      
    Loc: String,

    /* The state is the sum of reliabilities of people
     * who have confirmed that the event will take place */
    State: Number,

    /* The threshold is the minimum value of the state for which we will
     * consider the event as confirmed and include it in the user's calendar.
     * This is a field under the event to allow us later on to maybe assign different 
     * thresholds based on the class strength. For now, we could assign the same number
     * for all events */
    Threshold: Number
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
    Sections: [SectionSchema],
    CourseEvents: [EventSchema]
  });

  return mongoose.model('Course', CourseSchema);
}


module.exports.getCourseModel = getCourseModel;
