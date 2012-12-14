module.exports = function (app, Course, depts) {
    app.get('/api/courses', function(req, res) {
        var query = Course.find({});
        if (req.query.dept) {
            var dept = req.query.dept;
            if(!dept.match(/^[0-9]{2}$/))
                dept = depts[dept.replace('_', ' ').
                             replace('*', '&').replace('@',':')];
            query = query.$where('this.num.match(/^' + dept + '/)')
                    .sort('num');
        }


        if (req.query.number) {
            var num = req.query.number;
        	  if(num.length == 5)
	              num = num.substring(0,2) + '-' + num.substring(2);
	          query = query.where('num', num);
        }

        if (req.query.semester) {
            query = query.where('semester', Number(req.query.semester));
        }

        query = query.select("-sections -__v -course_events");
        query.exec(function(err, courses) {
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < courses.length; i++) {
                courses[i].CourseURL = "/api/courses/"
                    + courses[i]["Semester"]
                    + courses[i]["Num"];
            }
            res.send(JSON.stringify(courses));
        });
    });

    app.get('/api/courses/:course/sections/:section/subsections/:subsec',
            function(req, res) {
        var course = req.params.course;
        var section = req.params.section.replace("-"," ");
        var subsection = req.params.subsec;

        Course.findById(course, function(err, course) {
            if (err) {
                console.log(err);
                res.send(404, {error: "Course not found"});
            } else {
                res.send(course.sections.id(section).
                         subsections.id(subsection));
            }
        });
    });

    app.get('/api/courses/:course/sections/:section', function(req, res) {
        var course = req.params.course;
        var section = req.params.section.replace("-"," ");

        Course.findById(course, function(err, course) {
            if (err) {
                console.log(err);
                res.send(404, {error: "Course not found"});
            } else {
                res.send(course.sections.id(section));
            }
        });
    });

    //For the form /api/courses/131-15-122
    app.get('/api/courses/:course', function(req, res) {
        var course = req.params.course;

        Course.findById(course, function(err, course) {
            if (err) {
                console.log(err);
                res.send(404, {error: "Course not found"});
            } else {
                res.send(course);
            }
        });
    });


    /*returns the entire events array associated with an event */
    app.get('/api/courses/:course/events', function(req, res) {
        var course = req.params.course;

        Course.findById(course, function(err, course) {
            if (err) {
                console.log(err);
                res.send(404, {error: "Course not found"});
            } else {
                res.send(course.course_events);
            }
        });
    });


    app.post('/api/courses/:course/events', function(req, res) {
        if (req.body.data == undefined) {
            console.log(err);
            res.send(400, {error: "No event received."});
        } else {
            req.body.data.recur = null;
        }

        Course.findById(req.params.course, function(err, course) {
            if (err || course == undefined) {
                console.log(err);
                res.send(404, {error: "Course is not defined"});
            } else {
                course.course_events.push(req.body.data);
                course.save(function (err) {
                    if (err) {
                        console.log(err);
                        res.send(404, {error: "We messed up somewhere"});
                    } else {
                        res.send(course);
                    }
                });
            }
       });
    });

    app.del('/api/courses/:course/events', function(req, res) {
        Course.findById(req.params.course, function(err, course){
            if(err || (course == undefined)){
                console.log(err);
                res.send(404, {error: "Course is not defined"});                                                                                                       }
            course.course_events.remove(function(err){
                if(err){
                    console.log(err);
                    res.send(404, {error: "We messed up somewhere"});
                } else{
                    course.course_events = [];
                    course.save(function(err){
                        if(err){
                            console.log(err);
                            res.send(404, {error: "We messed up somewhere"});
                        }
                        else{
                            res.send(course);
                        }
                    });
                }
            });
        });
    });


    app.del('/api/courses/:course/events/:event', function(req, res) {
        Course.findById(req.params.course, function(err, course){
            if(err || (course == undefined)){
                console.log(err);
                res.send(404, {error: "Course is not defined"});
            }
            var event = course.course_events.id(req.params.event);
            if(event == undefined){
                console.log(err);
                res.send(404, {error: "Event not found"});
            }

            event.remove(function(err){
                if(err){
                    console.log(err);
                    res.send(404, {error: "We messed up somewhere"});
                }
                else{
                    course.save(function(err){
                        if(err){
                            console.log(err);
                            res.send(404, {error: "We messed up somewhere"});
                        }
                        else{
                            res.send(course);
                        }
                    });
                }
           });
       });
    });


    app.put('/api/courses/:course/events/:event',
            function (req, res) {
        if (req.body.data == undefined) {
            console.log(err);
            res.send(400, {error: "No event received."});
            return;
        }
        req.body.data._id = req.params.event;

        Course.findById(req.params.course, function(err, course){
            if(err) {
                console.log(err);
                res.send(500, {error: "No database connection."});
                return;
            }
            if (course == undefined) {
                console.log(err);
                res.send(404, {error: "Course not found."});
                return;
            }

            var event = course.course_events.id(req.params.event);
            if (event == undefined) {
                course.course_events.push(req.body.data);
            } else {
                if(req.body.data.event_type)
                    event.event_type = Number(req.body.data.event_type);
                if(req.body.data.title)
                    event.title = req.body.data.title;
                if(req.body.data.loc)
                    event.loc = req.body.data.loc;
                if(req.body.data.state)
                    event.state = req.body.data.state;
                if(req.body.data.threshold)
                    event.threshold = req.body.data.threshold;
                if(req.body.data.recur)
                    event.recur = req.body.data.recur;
            }

            course.save(function(err){
                if(err){
                    console.log(err);
                    res.send(400, {error: "Invalid event syntax."});
                } else {
                    res.send(course.course_events);
                }
            });
        });
    });
}
