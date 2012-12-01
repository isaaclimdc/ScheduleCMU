express = require('express');

module.exports = function (app, User) {
  app.post('/api/users/:user', function (req, res) {
    if (req.body.andrew == undefined) {
      res.send(404, {error: "Andrew ID required to create user."});
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


    // TODO later - generate random verify_code and send verification email.
    var u = {_id: req.params.user, andrew: req.body.andrew, verify_code: generateVC(req.body.andrew)};
    var newU = new User(u);

    newU.save(function (err) {
      if (err) {
        console.log(err);
        res.send(404, {error: "We screwed up somehow..."});
      } else {
        res.send(newU);
      }
    });

    newU.sendVerifyEmail();

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


  app.get('/api/users', function(req, res){
	  if (req.query.verify) {
	      //TODO: figure out syntax for findOneAndUpdate
	      User.findOne({verify_code: req.query.verify}, function(err, user){
		      if(err)
			  res.send(401, {error: "Invalid verification code"});
		      else{
			  User.update({_id: user._id}, {$set: {verify_code: null}}, function(err){
				  res.send(404, {error: "We messed up somewhere...."});
			      });
		      }
		  });
	  }
  });
}
