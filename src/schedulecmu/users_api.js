express = require('express');

module.exports = function (app, User) {
  app.put('/api/users/:user', function (req, res) {
    if (req.body.data == undefined) {
      res.send(400, {error: "No user received."});
      return;
    }
    if (req.body.data.andrew == undefined) {
      res.send(400, {error: "Andrew ID required to create user."});
      return;
    }

    // TODO later - check for auth token validity before adding user.
    if (req.body.auth_token == undefined) {
      res.send(401, {error: "Invalid auth_token."});
      return;
    }

    function generateVC(andrew){
        //generate a random two digit number
        var VC = (Math.floor(Math.random()*89) + 10).toString();
        //Map each character of the andrew id to its hex value
        /*This resolves the problem of ever having the same verify code
         *for two users, since andrew ids are unique*/
        for(var i = 0; i < andrew.length; i++){
            VC += (andrew.charCodeAt(i)).toString(16);
        }
        return VC;
    }


    var u = {_id: req.params.user,
             andrew: req.body.data.andrew,
             verify_code: generateVC(req.body.data.andrew)};
    var newU = new User(u);

    newU.save(function (err) {
      if (err) {
        console.log(err);
        res.send(404, {error: "We screwed up somehow..."});
      } else {
        res.send(newU);
        newU.sendVerifyEmail();
      }
    });
  });


  app.get('/api/users/:user', function (req, res) {
    User.findById(req.params.user, function (err, user) {
      if (err || user == undefined) {
        res.send(404, {error: "User does not exist."});
        return;
      }

      if (req.query.auth_token == undefined) {
        res.send(401, {error: "Invalid auth_token."});
        return;
      }

      user.authenticate(req.query.auth_token, function (state) {
        if (state === "verify")
          res.send(403, {error: "Email verification not complete."});
        else if (state === "invalid")
          res.send(401, {error: "Invalid auth_token."});
        else {
          // Does this work? I'm not sure... Test please
          delete user.andrew;
          delete user.auth_token;
          delete user.auth_expiry;
          res.send(user);
        }
      });
    });
  });


  app.post('/api/users/:user/verify', function(req, res){
    User.findById(req.params.user, function(err, user){
      if(err || user == undefined) {
        res.send(404, {error: "We messed up somewhere...."});
      } else {
          if (user.verify_code == req.body.verify_code) {
              user.verify_code = null;
              user.save(function(err){
                if (err)
                  res.send(404, {error: "We messed up somewhere...."});
              });
              res.send(user);
          } else {
              res.send(401, {error: "Invalid verification code"});
          }
      }
    });
  });

  //To create a new schedule
  app.post('/api/users/:user/schedules', function (req, res) {
    if (req.body.data == undefined) {
      res.send(400, {error: "No schedule received."});
      return;
    }

    User.findById(req.params.user, function(err, user){
      if(err) {
        console.log(err);
        res.send(500, {error: "No database connection."});
        return;
      }
      if (user == undefined) {
        res.send(404, {error: "User not found."});
        return;
      }
        
      user.schedules.push({semester: req.body.data.semester,
                           name: req.body.data.name});
      user.save(function(err){
        if (err){
          console.log(err);
          res.send(400, {error: "Incorrect schedule syntax."});
        } else {
          res.send(user);
        }
      });
    });
  });

  app.put('/api/users/:user/schedules/:schedule/blocks/:block',
           function (req, res) {
    if (req.body.data == undefined) {
      res.send(400, {error: "No block received."});
      return;
    }
    req.body.data._id = req.params.block;

    User.findById(req.params.user, function(err, user){
      if(err) {
        console.log(err);
        res.send(500, {error: "No database connection."});
        return;
      }
      if (user == undefined) {
        res.send(404, {error: "User not found."});
        return;
      }

      var schedule = user.schedules.id(req.params.schedule);
      if (schedule == undefined) {
        res.send(404, {error: "Schedule not found."});
        return;
      }

      var block = schedule.course_blocks.id(req.params.block);
      if (block == undefined) {
        schedule.course_blocks.push(req.body.data);
      } else {
        // Test if this works - modifies parent schedule...
        block.section_id = req.body.data.section_id;
        block.subsection_id = req.body.data.subsection_id;
      }

      user.save(function(err){
        if(err){
          res.send(400, {error: "Invalid block syntax."});
          console.log(err);
        } else {
          res.send(schedule.course_blocks);
        }
      });
    });
  });

}


