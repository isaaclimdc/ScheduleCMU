module.exports = function (app, User) {
  app.get('/api/users/:user', function (req, res) {
    User.findById(user, function (err, user) {
      user.authenticate(req.params.auth_token, function (state) {
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
