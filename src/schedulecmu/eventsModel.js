function getEventModel(Schema, mongoose) {
    var EventSchema = new Schema({
	    Num: Number,
	    Type: Number, //Since we have a drop down list of 4 types of events
	    Title: String,
	    Loc: String
	    Day: String,
	    Date: String
	    Start: String, //TODO:if we use dropdowns, these could be numbers
	    End: String, //TODO: we use dropdowns, these could be numbers
	    Loc: String
	});

    return mongoose.model('CourseEvent', EventSchema);
}


module.exports.getEventModel = getEventModel;
