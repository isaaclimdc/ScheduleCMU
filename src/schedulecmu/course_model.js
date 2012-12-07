function getCourseModel(mongoose, db) {
    var Schema = mongoose.Schema;

    var EventSchema = new Schema({

        /* event_type is a number since there are just 4 types of events */
        event_type: {type: Number},
        title: {type: String},
        loc: {type: String, default: null} ,
        start: {type: Date},
        end: {type: Date},

        /* recurring events have not been implemented yet */
        recur: {
            recurring: {type: Boolean, default: false},
            startDate: {type: Date, default: null},
            endDate: {type: Date, default: null},

            /* days is an optional field */
            days: [{type: String, match: /^[MTWRFSU]$/}],

            /* occurence represents options - daily, weekly, monthly, etc */
            occurence: {type: Number, default: null},

            /* frequency is how often the event occurs per _occurence_ */
            frequency: {type: Number, default: null}
        }
     });

    /* ClassSchema represents each lecture/recitation for the course */
    var ClassSchema = new Schema({
        day: {type: String, match: /^TBA$|^[MTWRFSU]$/},
        start: {type: String},
        end: {type: String},
        loc: {type: String}
     });

    /* SectionSchema is a recursive Schema
     * This allows us to define a lecture and it's associated recitations */
    var SectionSchema = new Schema();
    SectionSchema.add({
        num: {type: String},
        instructor: {type: String},
        mini: {type: Number, min: 0, max: 1, default: null},
        classes: [ClassSchema],
        subsections: [SectionSchema]
    });

    /* CourseSchema represents a particular course as a whole */
    var CourseSchema = new Schema({
        num: {type: String, match: /^[0-9]{1,2}-[0-9]{3}$/},
        name: String,
        semester: Number,
        units: String,
        details : {
            description: {type: String, default: null},
            url: {type: String, default: null},
            prereqs : {type: String, default: null},
            coreqs : {type: String, default: null}
        },
        sections: [SectionSchema],
        course_events: [EventSchema]
    });

    return db.model('Course', CourseSchema);
}


module.exports = getCourseModel;
