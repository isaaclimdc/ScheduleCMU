module.exports = function (app, User) {
  app.put('/api/users/:user', function (req, res) {
    if (req.body.andrew == undefined) {
      res.send(404, {error: "Andrew ID required to create user."});
      return;
    }

    // TODO later - check for auth token validity before adding user.
    if (req.body.auth_token == undefined) {
      res.send(401, {error: "Invalid auth_token."});
      return;
    }

    // TODO later - generate random verify_code and send verification email.
    var u = {_id: req.params.user, andrew: req.body.andrew};
    var newU = new User(u);
    u.save(function (err) {
      if (err) {
        console.log(err);
        res.send(404, {error: "We screwed up somehow..."});
      } else {
        res.send(u);
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
}
