module.exports = function (app, UEvent, User, Course) {


    /* To get all the events that a user has to verify */
    app.get('/api/events', function(req, res){
        if(req.query.user){
            User.findById(req.params.user, function(err, user){
                if(err || (user == undefined)){
                    console.log(err);
                    res.send(404, {error: 'User not found'});
                } else{
                    var schedule = user.schedules[0];
                    var events = [];
                    for(block in schedule){
                        var cur = UEvent.find({'course_num' : block._id});
                        events = events.concat(cur);
                    }
                    res.send(events);
                }
            });
        }
    });


    /* To post a new uevent */
    app.post('/api/events', function(req, res){
        if (req.body.data == undefined) {
            res.send(400, {error: "No event received."});
        } else {
            var event = req.body.data;
            if(event.recur == undefined){
                event.recur = null;
            }

            var uevent = new UEvent(event);
            uevent.save(function (err) {
                if (err) {
                    console.log(err);
                    res.send(404, {error: "We messed up somewhere"});
                } else {
                    res.send(uevent);
                }
            });
        }
    });


    /* To record a users response to an event */
    /* In data field of body send user_id, user_karma and user_response */
    /* Send +1 for yes and -1 for no and don't send for no response/don't know*/
    app.post('/api/events/:event/', function(req, res){
        if (req.body.data == undefined) {
            console.log(err);
            res.send(400, {error: "No response received."});
        } else {
            var info = req.body.data;
            if(info.user_id == undefined || (typeof info.user_karma != 'number')
               || (typeof info.user_response != 'number')){
                console.log(err);
                res.send(400, {error: "Response in incorrect format"});
            }


            UEvent.findById(req.params.event, function(err, uevent){
                if(err || uevent == undefined){
                    res.send(404, {error: "Event not found."});
                    return;
                } else {
                    uevent.state += (info.user_response * info.user_karma);
                    if(info.user_response === 1){
                        uevent.yes.push(info.user_id);
                        if(uevent.state >= uevent.threshold){
                            uevent.update_event();
                            res.send(req.params.event + " was verified");
                        } else{
                            uevent.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.send(404, {error: "We messed up somewhere"});
                                    } else {
                                        res.send(uevent);
                                    }
                            });
                        }
                    } else {
                        uevent.no.push(info.user_id);
                        if(uevent.state < 0){
                            uevent.remove_event();
                            res.send(req.params.event + " was removed");
                        } else{
                            uevent.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                        res.send(404, {error: "We messed up somewhere"});
                                    } else {
                                        res.send(uevent);
                                    }
                                });
                        }
                    }
                }
            });
        }
   });
}




