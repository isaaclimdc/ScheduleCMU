function getCourseModel(Schema, mongoose) {
  var ClassSchema = new Schema({
    Day: {type: String, match: /^TBA$|^[MTWRFSU]$/},
    Start: String, //TODO? Store these as numbers in the scraper ??
    End: String,
    //Currently matches string types "GHC 4401", "DH A301", "TBA", "GYM THSTL" 
    Loc: {type: String, match: /(^[A-Za-z]+\s[A-Z]?[0-9]+$)|^TBA$|(^[A-Za-z]+\s[A-Za-z]+$)/}
  });


  /* For the recurring schema, I tried to model data accepted by an interface like Google Calendar's
   * It would be great if we could build a similar interface */
  var RecurSchema = new Schema({
    StartDate: Date,
    EndDate: Date,
    Days: [{type: String, match: /^[MTWRFSU]$/}], //Optional
    Occurence: Number, //Various dropdown options - daily, weekly, monthly, etc
    Frequency: Number //Repeats every n days / weeks / months - depending on the ocurence field
  });
    

  var EventSchema = new Schema({
    //Num: Number - This should be handled client side, right?
    Type: Number, //Since we have a drop down list of 4 types of events       
    Title: String,
    Loc: {type: String, match: /(^[A-Za-z]+\s[A-Z]?[0-9]+$)|^TBA$|(^[A-Za-z]+\s[A-Za-z]+$)/} ,
    DateTime: Date,

    /* The state is the sum of reliabilities of people
     * who have confirmed that the event will take place */
    State: {type: Number, default: 0, min: 0},

    /* The threshold is the minimum value of the state for which we will
     * consider the event as confirmed and include it in the user's calendar.
     * This is a field under the event to allow us later on to maybe assign different 
     * thresholds based on the class strength. For now, we could assign the same number
     * for all events */
    Threshold: {type: Number, min: 0, default: 20},
    
    Recurring: {type: Boolean, default: false},
    RecurInfo: RecurSchema //Optional
  });

  var SectionSchema = new Schema();
  SectionSchema.add({
    //Matches between 1 and 3 (in case of TBA) alphanumeric characters
    Num: {type: String, match: /^[A-Za-z0-9]{1,3}^/}, 
    Instructor: String, //Can contain multiple instructors
    Mini: {type: Number, min: 0, max: 1, default: undefined}, //TODO? Check if this works.... 
    Classes: [ClassSchema],
    Subsections: [SectionSchema]
  });

  var CourseSchema = new Schema({
    Num: {type: Number, min: 10000, max: 99999}, //Restricts to five digits
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
