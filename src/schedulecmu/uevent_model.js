function getUEventModel(mongoose, db) {
    var Schema = mongoose.Schema;

    var UEventSchema = new Schema({
        course_num : {type: String},

        /* event info follows the event schema in course_model.js */
        event_info : {
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
                days: [{type: String, match: /^[MTWRFSU]$/}],
                occurence: {type: Number, default: null},
                frequency: {type: Number, default: null}
            }
        },

        /* state is the sum of karmas of people
         * who have confirmed that the event will take place */
        state: {type: Number, default: 0, min: 0},

        /* threshold is the minimum value of the state for which we will
         * consider the event as confirmed and include it in the user's calendar.
         * it is a field under the event to allow us later on to maybe assign
         * different thresholds based on the class strength.
         * for now, we could assign the same number for all events */
        threshold: {type: Number, min: 0, default: 20},

        /* created_by stores the user id of the creator - for karma purposes */
        created_by: {type: String},

        /* yes stores the user ids of those who voted yes - for karma purposes*/
        yes: [{type: String}],

        /* no stores the user ids of those who voted no - for karma purposes */
        no: [{type: String}]
    });

    UEventSchema.methods.update_event = function(Course){
        Course.findById(this.course_num, function(err, course){
            if(err || (course == undefined)){
                res.send(404, {error: "Course not found"});
                return;
            } else {
                var event = new Event(this.event_info);
                course.course_events.push(event);
                course.save(function (err) {
                        if (err) {
                            console.log(err);
                            res.send(404, {error: "We messed up somewhere"});
                        } else {
                            res.send(event);
                            this.remove();
                        }
                    });
            }
        });
    }

    UEventSchema.methods.remove_event = function(){
        this.remove();
        res.send("Event was removed");
    }

    return db.model('UEvent', UEventSchema);
}

module.exports = getUEventModel;



