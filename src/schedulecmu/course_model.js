function getCourseModel(mongoose, db) {
  var Schema = mongoose.Schema;


  var EventSchema = new Schema({
    //Num: Number - This should be handled client side, right?
    event_type: {type: Number}, //Since we have a drop down list of 4 types of events
    title: {type: String},
    loc: {type: String, default: null} ,
    start: {type: Date},
    end: {type: Date},

    /* The state is the sum of reliabilities of people
     * who have confirmed that the event will take place */
    state: {type: Number, default: 0, min: 0},

    /* The threshold is the minimum value of the state for which we will
     * consider the event as confirmed and include it in the user's calendar.
     * This is a field under the event to allow us later on to maybe assign different
     * thresholds based on the class strength. For now, we could assign the same number
     * for all events */
    threshold: {type: Number, min: 0, default: 20},

    recur: {
      recurring: {type: Boolean, default: false},
      startDate: {type: Date, default: null},
      endDate: {type: Date, default: null},
      days: [{type: String, match: /^[MTWRFSU]$/}], //Optional
      occurence: {type: Number, default: null}, //Various dropdown options - daily, weekly, monthly, etc
      frequency: {type: Number, default: null} //Repeats every n days / weeks / months - depending on the ocurence field
  }});



  var ClassSchema = new Schema({
    day: {type: String, match: /^TBA$|^[MTWRFSU]$/},
    start: {type: String}, //TODO? Store these as numbers in the scraper ??
    end: {type: String},
    //Currently matches string types "GHC 4401", "DH A301", "TBA", "GYM THSTL"
    loc: {type: String}
  });

  var SectionSchema = new Schema();
  SectionSchema.add({
    //Matches between 1 and 3 (in case of TBA) alphanumeric characters
    num: {type: String},
    instructor: {type: String}, //TODO convert TBA to nulls
    mini: {type: Number, min: 0, max: 1, default: null},
    classes: [ClassSchema],
    subsections: [SectionSchema]
  });

  var CourseSchema = new Schema({
    num: {type: String, match: /^[0-9]{1,2}-[0-9]{3}$/},
    name: String,
    semester: Number,
    description: {type: String, default: null},
    URL: {type: String, default: null},
    units: String,
    sections: [SectionSchema],
    course_events: [EventSchema]
  });

  return db.model('Course', CourseSchema);
}


module.exports = getCourseModel;
